import { expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref, shallowRef } from '@usevibejs/ui';
import {
  useClipboard,
  useDocumentVisibility,
  useMediaQuery,
  useOnline,
  usePermission,
  usePreferredDark,
  useSupported,
  useWindowSize,
} from './state.ts';
import { useDark, useFavicon, useTitle } from './document.ts';
import { useEventListener } from './events.ts';
import { mediaMock } from '../../test/browser-mocks.ts';

it('rebinds event targets without duplicates and cleans capture options', () => {
  const a = document.createElement('button');
  const b = document.createElement('button');
  const target = shallowRef<HTMLElement | null>(a);
  const fn = vi.fn();
  const options = { capture: true };
  const listener = useEventListener(target, 'click', fn, options);
  options.capture = false;
  a.click();
  target.value = b;
  a.click();
  b.click();
  target.value = b;
  b.click();
  expect(fn).toHaveBeenCalledTimes(3);
  target.value = null;
  b.click();
  listener.stop();
  expect(fn).toHaveBeenCalledTimes(3);
});
it('tracks window size, visibility and connection events', () => {
  const scope = effectScope();
  const [size, visibility, online] = scope.run(
    () => [useWindowSize(), useDocumentVisibility(), useOnline()] as const,
  )!;
  expect(size.width.value).toBe(window.innerWidth);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
  window.dispatchEvent(new Event('resize'));
  expect(size.width.value).toBe(800);
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(visibility.visibility.value).toBe('hidden');
  window.dispatchEvent(new Event('offline'));
  expect(online.isOnline.value).toBe(false);
  window.dispatchEvent(new Event('online'));
  expect(online.isOnline.value).toBe(true);
  scope.stop();
  window.dispatchEvent(new Event('offline'));
  expect(online.isOnline.value).toBe(true);
});
it('replaces media queries, observes system darkness and handles missing matchMedia', () => {
  const { queries } = mediaMock();
  const query = ref('(min-width: 600px)');
  const m = useMediaQuery(query);
  expect(m.matches.value).toBe(false);
  queries[0].change(true);
  expect(m.matches.value).toBe(true);
  query.value = '(max-width: 600px)';
  queries[0].change(true);
  expect(m.matches.value).toBe(false);
  queries[1].change(true);
  m.stop();
  queries[1].change(false);
  expect(m.matches.value).toBe(true);
  const preferred = usePreferredDark();
  expect(queries.at(-1)?.media).toBe('(prefers-color-scheme: dark)');
  preferred.stop();
  vi.stubGlobal('matchMedia', undefined);
  const missing = useMediaQuery('test', { initialValue: true });
  expect(missing.isSupported).toBe(false);
  expect(missing.matches.value).toBe(true);
  missing.stop();
});
it('applies darkness only to explicit targets, restores classes and persists explicit preferences', () => {
  const { queries } = mediaMock();
  const untouched = useDark();
  untouched.set('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  untouched.stop();
  const a = document.createElement('div');
  const b = document.createElement('div');
  const target = shallowRef<Element | null>(a);
  const dark = useDark({ target, storageKey: 'theme', className: 'night' });
  queries.at(-1)!.change(true);
  expect(a.classList.contains('night')).toBe(true);
  dark.toggle();
  expect(a.classList.contains('night')).toBe(false);
  expect(localStorage.getItem('theme')).toBe('"light"');
  dark.set('dark');
  target.value = b;
  expect(a.classList.contains('night')).toBe(false);
  expect(b.classList.contains('night')).toBe(true);
  dark.stop();
  expect(b.classList.contains('night')).toBe(false);
  localStorage.setItem('invalid-theme', '"wrong"');
  const invalid = useDark({ storageKey: 'invalid-theme' });
  expect(invalid.error?.value).toBeInstanceOf(Error);
  invalid.stop();
});
it('changes and restores document title and favicon nodes', () => {
  document.title = 'before';
  const title = ref('one');
  const t = useTitle(title);
  title.value = 'two';
  expect(document.title).toBe('two');
  t.stop();
  expect(document.title).toBe('before');
  const noRestore = useTitle('kept', { restoreOnStop: false });
  noRestore.stop();
  expect(document.title).toBe('kept');
  const href = ref<string | null>('one.svg');
  const f = useFavicon(href);
  expect(document.querySelector('link')?.getAttribute('href')).toBe('one.svg');
  href.value = null;
  expect(document.querySelector('link')?.hasAttribute('href')).toBe(false);
  f.stop();
  expect(document.querySelector('link')).toBeNull();
  const existing = document.createElement('link');
  existing.rel = 'icon';
  document.head.append(existing);
  const restore = useFavicon('two.svg');
  restore.stop();
  expect(existing.hasAttribute('href')).toBe(false);
  existing.href = 'old.svg';
  const old = useFavicon('new.svg');
  old.stop();
  expect(existing.getAttribute('href')).toBe('old.svg');
  existing.remove();
});
it('reports clipboard success only after resolution and handles rejection and racing writes', async () => {
  let resolve: () => void = () => {};
  const writeText = vi.fn(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const nav = { clipboard: { writeText } } as unknown as Navigator;
  const c = useClipboard({ navigator: nav });
  const pending = c.copy('a');
  expect(c.copied.value).toBe(false);
  expect(c.isPending.value).toBe(true);
  resolve();
  expect(await pending).toBe(true);
  expect(c.text.value).toBe('a');
  writeText.mockRejectedValueOnce(new DOMException('permission'));
  expect(await c.copy('b')).toBe(false);
  expect(c.error.value).toBeInstanceOf(DOMException);
  expect(c.copied.value).toBe(false);
  const first = c.copy('first');
  const finishFirst = resolve;
  const second = c.copy('second');
  finishFirst();
  expect(await first).toBe(false);
  resolve();
  expect(await second).toBe(true);
  const late = c.copy('late');
  c.stop();
  resolve();
  expect(await late).toBe(false);
  expect(c.text.value).toBe('second');
  expect(await c.copy('stopped')).toBe(false);
  const missing = useClipboard({ navigator: {} as Navigator });
  expect(await missing.copy('x')).toBe(false);
  expect(missing.isSupported).toBe(false);
  missing.stop();
});
it('distinguishes permission absence, denial, query failures and stale async results', async () => {
  const status = Object.assign(new EventTarget(), { state: 'prompt' as PermissionState });
  const query = vi.fn().mockResolvedValue(status);
  const p = usePermission(
    { name: 'geolocation' },
    { navigator: { permissions: { query } } as unknown as Navigator },
  );
  expect(p.state.value).toBe('unknown');
  await Promise.resolve();
  expect(p.state.value).toBe('prompt');
  status.state = 'denied';
  status.dispatchEvent(new Event('change'));
  expect(p.state.value).toBe('denied');
  await p.query();
  p.stop();
  status.state = 'granted';
  status.dispatchEvent(new Event('change'));
  expect(p.state.value).toBe('denied');
  await p.query();
  const missing = usePermission({ name: 'geolocation' }, { navigator: {} as Navigator });
  expect(missing.state.value).toBe('unsupported');
  await missing.query();
  missing.stop();
  query.mockRejectedValueOnce(new TypeError('unsupported descriptor'));
  const bad = usePermission(
    { name: 'geolocation' },
    { navigator: { permissions: { query } } as unknown as Navigator },
  );
  await Promise.resolve();
  expect(bad.state.value).toBe('unknown');
  expect(bad.error.value).toBeInstanceOf(TypeError);
  bad.stop();
  const late = usePermission(
    { name: 'geolocation' },
    { navigator: { permissions: { query } } as unknown as Navigator },
  );
  late.stop();
  await Promise.resolve();
  expect(late.state.value).toBe('unknown');
  const check = ref(false);
  const supported = useSupported(() => check.value);
  expect(supported.isSupported.value).toBe(false);
  check.value = true;
  expect(supported.isSupported.value).toBe(true);
  expect(
    useSupported(() => {
      throw new Error();
    }).isSupported.value,
  ).toBe(false);
  await nextTick();
});
it('retains readonly theme state for nonpersistent preferences and nullable targets', () => {
  mediaMock(true);
  const target = shallowRef<Element | null>(null);
  const dark = useDark({ target, initialValue: 'light' });
  expect(dark.isDark.value).toBe(false);
  dark.set('auto');
  expect(dark.isDark.value).toBe(true);
  dark.set('dark');
  dark.stop();
});
it('uses configured fallback dimensions and keeps the last clipboard error stable after late rejection', async () => {
  const noSize = useWindowSize({ window: new EventTarget() as Window });
  expect(noSize.width.value).toBe(0);
  expect(noSize.height.value).toBe(0);
  noSize.stop();
  let reject: (error: unknown) => void = () => {};
  const writeText = () =>
    new Promise<void>((_resolve, r) => {
      reject = r;
    });
  const c = useClipboard({ navigator: { clipboard: { writeText } } as unknown as Navigator });
  const p = c.copy('late');
  c.stop();
  reject(new Error('late'));
  expect(await p).toBe(false);
  expect(c.error.value).toBeUndefined();
});
it('ignores a superseded permission query and guards an already-queued status notification after stop', async () => {
  let finish: (status: PermissionStatus) => void = () => {};
  const query = vi.fn(
    () =>
      new Promise<PermissionStatus>((r) => {
        finish = r;
      }),
  );
  const p = usePermission(
    { name: 'geolocation' },
    { navigator: { permissions: { query } } as unknown as Navigator },
  );
  const first = finish;
  const second = p.query();
  const status = Object.assign(new EventTarget(), {
    state: 'granted' as PermissionState,
    onchange: null,
    name: 'geolocation',
  });
  first(status);
  finish(status);
  await second;
  expect(p.state.value).toBe('granted');
  const add = vi.spyOn(status, 'addEventListener');
  const third = p.query();
  finish(status);
  await third;
  const queued = add.mock.calls[0][1];
  p.stop();
  status.state = 'denied';
  if (typeof queued === 'function') queued.call(status, new Event('change'));
  expect(p.state.value).toBe('granted');
});
it.each(['auto', 'light', 'dark'] as const)(
  'loads a valid %s color choice and restores preexisting target classes',
  (preference) => {
    mediaMock();
    localStorage.setItem('theme-valid', JSON.stringify(preference));
    const target = document.createElement('div');
    target.className = 'dark';
    const theme = useDark({ target, storageKey: 'theme-valid' });
    expect(theme.preference.value).toBe(preference);
    theme.stop();
    expect(target.classList.contains('dark')).toBe(true);
  },
);
it('does not create an empty favicon link and ignores links with other relations', () => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  document.head.append(style);
  const href = ref<string | null>(null);
  const icon = useFavicon(href);
  expect(document.querySelector('link[rel="icon"]')).toBeNull();
  href.value = '/one.svg';
  expect(document.querySelector('link[rel="icon"]')).not.toBeNull();
  icon.stop();
  style.remove();
});
it('ignores permission query rejection after disposal', async () => {
  const query = () => Promise.reject(new Error('late failure'));
  const p = usePermission(
    { name: 'geolocation' },
    { navigator: { permissions: { query } } as unknown as Navigator },
  );
  p.stop();
  await Promise.resolve();
  expect(p.error.value).toBeUndefined();
  expect(p.state.value).toBe('unknown');
});
it('toggles from explicit light to dark without touching any unrequested document', () => {
  mediaMock();
  const theme = useDark({ initialValue: 'light' });
  theme.toggle();
  expect(theme.preference.value).toBe('dark');
  theme.stop();
});
