import { expect, it, vi } from 'vitest';
import { effectScope, nextTick, shallowRef } from '@usevibejs/ui';
import { useIntersectionObserver, useMutationObserver, useResizeObserver } from './observers.ts';
import { useElementBounding, useElementSize } from './measure.ts';
import { useClickOutside, useFocus, useScroll } from './input.ts';
import { observerMock } from '../../test/browser-mocks.ts';

it.each(['ResizeObserver', 'IntersectionObserver', 'MutationObserver'] as const)(
  '%s handles late targets, replacement, pause/resume and stale notifications',
  async (name) => {
    const instances = observerMock(name);
    const target = shallowRef<Element | null>(null);
    const fn = vi.fn();
    const observer =
      name === 'ResizeObserver'
        ? useResizeObserver(target, fn)
        : name === 'IntersectionObserver'
          ? useIntersectionObserver(target, fn)
          : useMutationObserver(target, fn);
    expect(instances).toHaveLength(0);
    target.value = document.createElement('div');
    await nextTick();
    expect(instances).toHaveLength(1);
    instances[0].fire();
    expect(fn).toHaveBeenCalledTimes(1);
    target.value = document.createElement('div');
    await nextTick();
    expect(instances[0].disconnect).toHaveBeenCalledOnce();
    instances[0].fire();
    expect(fn).toHaveBeenCalledTimes(1);
    observer.pause();
    await nextTick();
    instances[1].fire();
    expect(fn).toHaveBeenCalledTimes(1);
    observer.resume();
    await nextTick();
    instances[2].fire();
    expect(fn).toHaveBeenCalledTimes(2);
    observer.stop();
    observer.resume();
    await nextTick();
    instances[2].fire();
    expect(instances[2].disconnect).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledTimes(2);
  },
);
it.each(['ResizeObserver', 'IntersectionObserver', 'MutationObserver'] as const)(
  '%s safely handles unavailable constructors',
  (name) => {
    vi.stubGlobal(name, undefined);
    const target = document.createElement('div');
    const fn = vi.fn();
    const observer =
      name === 'ResizeObserver'
        ? useResizeObserver(target, fn)
        : name === 'IntersectionObserver'
          ? useIntersectionObserver(target, fn)
          : useMutationObserver(target, fn);
    expect(observer.isSupported).toBe(false);
    observer.stop();
  },
);
it('measures bounds and content size, then resets when target disappears', async () => {
  const instances = observerMock('ResizeObserver');
  const el = document.createElement('div');
  document.body.append(el);
  const rect = {
    x: 10,
    y: 20,
    left: 10,
    top: 20,
    right: 110,
    bottom: 70,
    width: 100,
    height: 50,
    toJSON: () => ({}),
  };
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect);
  const target = shallowRef<Element | null>(el);
  const bounds = useElementBounding(target);
  const size = useElementSize(target);
  expect(bounds.width.value).toBe(100);
  expect(bounds.x.value).toBe(10);
  expect(size.height.value).toBe(50);
  instances.at(-1)!.fire([{ target: el, contentRect: { width: 80, height: 30 } }]);
  expect(size.width.value).toBe(80);
  rect.x = 15;
  window.dispatchEvent(new Event('scroll'));
  expect(bounds.x.value).toBe(15);
  window.dispatchEvent(new Event('resize'));
  target.value = null;
  await nextTick();
  expect(bounds.width.value).toBe(0);
  expect(size.width.value).toBe(0);
  bounds.stop();
  bounds.update();
  size.stop();
  const detached = useElementBounding(el, { windowResize: false, windowScroll: false });
  el.remove();
  detached.update();
  expect(detached.width.value).toBe(0);
  detached.stop();
});
it('tracks focus and supports focus before and after target replacement', async () => {
  const a = document.createElement('input');
  const b = document.createElement('input');
  document.body.append(a, b);
  const target = shallowRef<HTMLElement | null>(null);
  const f = useFocus(target, { initialValue: true, preventScroll: true });
  target.value = a;
  await nextTick();
  expect(document.activeElement).toBe(a);
  expect(f.focused.value).toBe(true);
  f.set(false);
  expect(f.focused.value).toBe(false);
  target.value = b;
  await nextTick();
  expect(f.focused.value).toBe(true);
  f.stop();
  f.set(false);
  expect(document.activeElement).toBe(b);
});
it('handles pointer origins, keyboard clicks, focus and excluded elements for click-outside', () => {
  const container = document.createElement('div');
  const child = document.createElement('button');
  container.append(child);
  const ignore = document.createElement('button');
  const outside = document.createElement('button');
  document.body.append(container, ignore, outside);
  const fn = vi.fn();
  const target = shallowRef<Element | null>(container);
  const c = useClickOutside(target, fn, { ignore: [ignore], detectFocus: true });
  const down = (el: Element) =>
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
  down(child);
  outside.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  expect(fn).not.toHaveBeenCalled();
  down(outside);
  outside.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  expect(fn).toHaveBeenCalledTimes(1);
  ignore.click();
  child.click();
  expect(fn).toHaveBeenCalledTimes(1);
  outside.click();
  expect(fn).toHaveBeenCalledTimes(2);
  outside.focus();
  expect(fn).toHaveBeenCalledTimes(3);
  target.value = null;
  outside.click();
  expect(fn).toHaveBeenCalledTimes(3);
  c.stop();
});
it('reads both scroll axes, boundaries, reactive targets and native programmatic updates', async () => {
  observerMock('ResizeObserver');
  const a = document.createElement('div');
  const b = document.createElement('div');
  Object.defineProperties(a, {
    scrollWidth: { value: 500 },
    clientWidth: { value: 100 },
    scrollHeight: { value: 1000 },
    clientHeight: { value: 100 },
  });
  Object.defineProperty(a, 'scrollTo', {
    value: vi.fn(({ left, top }: ScrollToOptions = {}) => {
      a.scrollLeft = left ?? 0;
      a.scrollTop = top ?? 0;
    }),
  });
  const target = shallowRef<Element | Window | null>(a);
  const s = useScroll(target);
  expect(s.maxX.value).toBe(400);
  expect(s.arrivedState.value.top).toBe(true);
  s.scrollTo({ x: 400, y: 900 });
  expect(s.arrivedState.value.right).toBe(true);
  expect(s.arrivedState.value.bottom).toBe(true);
  s.scrollTo({ y: 100, behavior: 'smooth' });
  expect(a.scrollTo).toHaveBeenLastCalledWith({ left: 400, top: 100, behavior: 'smooth' });
  a.scrollTop = 50;
  a.dispatchEvent(new Event('scroll'));
  expect(s.y.value).toBe(50);
  target.value = b;
  await nextTick();
  a.dispatchEvent(new Event('scroll'));
  expect(s.y.value).toBe(0);
  target.value = null;
  await nextTick();
  expect(s.maxY.value).toBe(0);
  target.value = window;
  await nextTick();
  s.stop();
  s.measure();
  s.scrollTo({ x: 2 });
});
it('disconnects all observers across repeated scope disposal', () => {
  const instances = observerMock('ResizeObserver');
  const el = document.createElement('div');
  for (let i = 0; i < 25; i++) {
    const scope = effectScope();
    scope.run(() => useResizeObserver(el, vi.fn()));
    scope.stop();
  }
  expect(instances).toHaveLength(25);
  expect(instances.every((instance) => instance.disconnect.mock.calls.length === 1)).toBe(true);
});
it('ignores resize entries for a replaced target and reports zero for a detached target', async () => {
  const instances = observerMock('ResizeObserver');
  const a = document.createElement('div');
  document.body.append(a);
  const target = shallowRef<Element | null>(a);
  const size = useElementSize(target);
  instances[0].fire([
    { target: document.createElement('div'), contentRect: { width: 80, height: 40 } },
  ]);
  expect(size.width.value).toBe(0);
  a.remove();
  instances[0].fire([{ target: a, contentRect: { width: 80, height: 40 } }]);
  expect(size.width.value).toBe(0);
  expect(size.height.value).toBe(0);
  target.value = document.createElement('div');
  instances[0].fire([{ target: a, contentRect: { width: 80, height: 40 } }]);
  expect(size.width.value).toBe(0);
  await nextTick();
  size.stop();
});
it('measures content-box initial size without including padding or borders', () => {
  observerMock('ResizeObserver');
  const el = document.createElement('div');
  el.style.cssText = 'padding: 5px 10px; border: 2px solid black';
  document.body.append(el);
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 124,
    bottom: 64,
    width: 124,
    height: 64,
    toJSON: () => ({}),
  });
  const size = useElementSize(el);
  expect(size.width.value).toBe(100);
  expect(size.height.value).toBe(50);
  size.stop();
});
it('filters secondary clicks, reactive exclusions, and focus events from inside the target', () => {
  const el = document.createElement('button');
  const outside = document.createElement('button');
  document.body.append(el, outside);
  const ignore = shallowRef<Element | null>(null);
  const fn = vi.fn();
  const c = useClickOutside(el, fn, { ignore: [ignore], detectFocus: true });
  el.focus();
  expect(fn).not.toHaveBeenCalled();
  outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 1 }));
  outside.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 1, detail: 1 }));
  expect(fn).not.toHaveBeenCalled();
  ignore.value = outside;
  outside.click();
  expect(fn).not.toHaveBeenCalled();
  c.stop();
});
it('uses default programmatic scroll behavior and offset boundaries', () => {
  observerMock('ResizeObserver');
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollTo', { value: vi.fn() });
  const scroll = useScroll(el, { offset: 2 });
  scroll.scrollTo({});
  expect(el.scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
  scroll.stop();
});
it('handles outside clicks with default exclusions and an element in a document without a view', () => {
  const el = document.createElement('button');
  const outside = document.createElement('button');
  document.body.append(el, outside);
  const fn = vi.fn();
  const c = useClickOutside(el, fn);
  outside.click();
  expect(fn).toHaveBeenCalledOnce();
  c.stop();
  observerMock('ResizeObserver');
  const otherDoc = document.implementation.createHTMLDocument();
  const measured = otherDoc.createElement('div');
  otherDoc.body.append(measured);
  const size = useElementSize(measured);
  expect(size.width.value).toBe(0);
  size.stop();
});
