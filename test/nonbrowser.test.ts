// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { effectScope } from '@usevibejs/ui';
import * as use from '../src/index.ts';

it('imports every entry and creates browser composables without browser globals', async () => {
  expect(Object.keys(use).filter((key) => key.startsWith('use'))).toHaveLength(42);
  const scope = effectScope();
  const state = scope.run(() => ({
    size: use.useWindowSize({ initialWidth: 20, initialHeight: 30 }),
    media: use.useMediaQuery('x'),
    dark: use.useDark({ target: null }),
    visibility: use.useDocumentVisibility(),
    online: use.useOnline(),
    clipboard: use.useClipboard(),
    permission: use.usePermission({ name: 'geolocation' }),
    storage: use.useStorage('x', 1),
    session: use.useSessionStorage('x', 1),
    title: use.useTitle('x'),
    favicon: use.useFavicon(null),
    resize: use.useResizeObserver(null, () => {}),
    intersection: use.useIntersectionObserver(null, () => {}),
    mutation: use.useMutationObserver(null, () => {}),
    bounds: use.useElementBounding(null),
    sizeElement: use.useElementSize(null),
    focus: use.useFocus(null),
    click: use.useClickOutside(null, () => {}),
    scroll: use.useScroll(null),
    mouse: use.useMouse(),
    mouseElement: use.useMouseInElement(null),
    key: use.useKeyPressed('x'),
    modifier: use.useKeyModifier('Shift'),
    ratio: use.useDevicePixelRatio(),
    raf: use.useRafFn(() => {}),
    idle: use.useIdleCallback(() => {}),
  }))!;
  expect(state.size.width.value).toBe(20);
  expect(state.size.height.value).toBe(30);
  expect(state.storage.isSupported).toBe(false);
  expect(state.session.isSupported).toBe(false);
  expect(state.permission.state.value).toBe('unsupported');
  expect(state.ratio.pixelRatio.value).toBe(1);
  expect(state.online.isOnline.value).toBe(true);
  expect(state.visibility.visibility.value).toBe('visible');
  expect(await state.clipboard.copy('x')).toBe(false);
  state.focus.set(true);
  state.focus.set(false);
  state.scroll.scrollTo({ y: 10 });
  scope.stop();
  await import('../src/reactivity/index.ts');
  await import('../src/browser/index.ts');
  await import('../src/storage/index.ts');
  await import('../src/elements/index.ts');
  await import('../src/sensors/index.ts');
  await import('../src/timers/index.ts');
});
it('refuses resource allocation inside an already stopped scope', () => {
  const scope = effectScope();
  const fn = vi.fn();
  scope.run(() => {
    scope.stop();
    expect(() => use.useEventBus()).toThrow('stopped scope');
  });
  expect(fn).not.toHaveBeenCalled();
});
