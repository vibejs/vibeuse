import { expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from '@usevibejs/ui';
import { useInfiniteScroll } from './infinite.ts';
import { observerMock } from '../../test/browser-mocks.ts';

function box(el: HTMLElement, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(el, key, { configurable: true, value });
  return el;
}

function element(values: Record<string, number> = {}) {
  return box(document.createElement('div'), {
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 100,
    scrollHeight: 500,
    clientWidth: 100,
    clientHeight: 100,
    ...values,
  });
}

async function drain() {
  for (let i = 0; i < 12; i++) await Promise.resolve();
}

it('loads near the bottom, blocks overlap, and honors canLoadMore', async () => {
  observerMock('ResizeObserver');
  const el = element({ scrollTop: 390 });
  let release: () => void = () => {};
  const load = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  let allow = true;
  const feed = useInfiniteScroll(el, load, { distance: 10, canLoadMore: () => allow });
  await nextTick();
  expect(load).toHaveBeenCalledOnce();
  expect(feed.isLoading.value).toBe(true);
  el.dispatchEvent(new Event('scroll'));
  expect(load).toHaveBeenCalledOnce();
  release();
  await drain();
  expect(feed.isLoading.value).toBe(false);
  allow = false;
  feed.check();
  expect(load).toHaveBeenCalledOnce();
  allow = true;
  box(el, { scrollTop: 0 });
  feed.check();
  expect(load).toHaveBeenCalledOnce();
  box(el, { scrollTop: 390 });
  feed.check();
  await drain();
  expect(load).toHaveBeenCalledTimes(2);
  release();
  await drain();
  feed.stop();
  feed.check();
  expect(load).toHaveBeenCalledTimes(2);
});

it('loads each edge, a window scroller, and a negative distance as zero', async () => {
  observerMock('ResizeObserver');
  const top = element({ scrollTop: 4, scrollHeight: 400 });
  const topLoad = vi.fn();
  const topFeed = useInfiniteScroll(top, topLoad, { direction: 'top', distance: 5 });
  await nextTick();
  expect(topLoad).toHaveBeenCalledOnce();
  topFeed.stop();
  const left = element({ scrollLeft: 0, scrollWidth: 400, clientWidth: 100 });
  const leftLoad = vi.fn();
  const leftFeed = useInfiniteScroll(left, leftLoad, { direction: 'left', distance: 0 });
  await nextTick();
  expect(leftLoad).toHaveBeenCalledOnce();
  leftFeed.stop();
  const right = element({ scrollLeft: 290, scrollWidth: 400, clientWidth: 100 });
  const rightLoad = vi.fn();
  const rightFeed = useInfiniteScroll(right, rightLoad, { direction: 'right', distance: 10 });
  await nextTick();
  expect(rightLoad).toHaveBeenCalledOnce();
  rightFeed.stop();
  const far = element({ scrollTop: 10 });
  const farLoad = vi.fn();
  const farFeed = useInfiniteScroll(far, farLoad, { distance: -5 });
  await nextTick();
  expect(farLoad).not.toHaveBeenCalled();
  farFeed.stop();
  const scrolling = element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 });
  Object.defineProperty(document, 'scrollingElement', { configurable: true, get: () => scrolling });
  const windowLoad = vi.fn();
  const windowFeed = useInfiniteScroll(window, windowLoad);
  await nextTick();
  expect(windowLoad).toHaveBeenCalledOnce();
  windowFeed.stop();
  Object.defineProperty(document, 'scrollingElement', { configurable: true, get: () => null });
  const emptyLoad = vi.fn();
  const emptyFeed = useInfiniteScroll(window, emptyLoad);
  await nextTick();
  expect(emptyLoad).not.toHaveBeenCalled();
  emptyFeed.stop();
  delete (document as { scrollingElement?: Element | null }).scrollingElement;
});

it('chains another load only when the metrics change, including after an interval', async () => {
  vi.useFakeTimers();
  observerMock('ResizeObserver');
  const el = element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 });
  let height = 500;
  let pages = 0;
  const growing = useInfiniteScroll(
    el,
    () => {
      pages += 1;
      height += 100;
      box(el, { scrollHeight: height, scrollTop: height - 100 });
    },
    { distance: 20, canLoadMore: () => pages < 2 },
  );
  await nextTick();
  await drain();
  expect(pages).toBe(2);
  growing.stop();
  const delayed = element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 });
  let delayedPages = 0;
  const delayedFeed = useInfiniteScroll(
    delayed,
    () => {
      delayedPages += 1;
      const next = 500 + delayedPages * 100;
      box(delayed, { scrollHeight: next, scrollTop: next - 100 });
    },
    { interval: 1000, canLoadMore: () => delayedPages < 2 },
  );
  await nextTick();
  await drain();
  expect(delayedPages).toBe(1);
  delayed.dispatchEvent(new Event('scroll'));
  expect(delayedPages).toBe(1);
  await vi.advanceTimersByTimeAsync(1000);
  await drain();
  expect(delayedPages).toBe(2);
  delayedFeed.stop();
  vi.useRealTimers();
});

it('records a rejection, drops a removed target, and checks from the observer', async () => {
  const instances = observerMock('ResizeObserver');
  const target = shallowRef<HTMLElement | null>(element({ scrollTop: 0 }));
  const resize = new EventTarget();
  const missed = vi.fn();
  const idle = useInfiniteScroll(target, missed, { window: resize as unknown as Window });
  await nextTick();
  expect(missed).not.toHaveBeenCalled();
  resize.dispatchEvent(new Event('resize'));
  instances.at(-1)?.fire();
  expect(missed).not.toHaveBeenCalled();
  idle.stop();
  let reject: (error: Error) => void = () => {};
  const source = element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 });
  const failing = useInfiniteScroll(
    source,
    () =>
      new Promise<void>((_resolve, fail) => {
        reject = fail;
      }),
  );
  await nextTick();
  expect(failing.isLoading.value).toBe(true);
  failing.stop();
  reject(new Error('network'));
  await drain();
  expect(failing.error.value).toBeUndefined();
  expect(failing.isLoading.value).toBe(false);
  const removed = shallowRef<HTMLElement | null>(
    element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 }),
  );
  let finish: () => void = () => {};
  const leaving = useInfiniteScroll(
    removed,
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  await nextTick();
  removed.value = null;
  finish();
  await drain();
  expect(leaving.error.value).toBeUndefined();
  expect(leaving.isLoading.value).toBe(false);
  leaving.stop();
  const stable = element({ scrollTop: 400, scrollHeight: 500, clientHeight: 100 });
  const once = vi.fn(() => Promise.reject(new Error('nope')));
  const reported = useInfiniteScroll(stable, once);
  await nextTick();
  await drain();
  expect(once).toHaveBeenCalledOnce();
  expect(reported.error.value).toBeInstanceOf(Error);
  expect((reported.error.value as Error).message).toBe('nope');
  expect(reported.isLoading.value).toBe(false);
  box(stable, { scrollTop: 0 });
  stable.dispatchEvent(new Event('scroll'));
  expect(once).toHaveBeenCalledOnce();
  reported.stop();
  const absent = useInfiniteScroll(null, vi.fn());
  await nextTick();
  absent.check();
  absent.stop();
});
