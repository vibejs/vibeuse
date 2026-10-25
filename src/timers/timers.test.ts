import { expect, it, vi } from 'vitest';
import { effectScope, ref } from '@usevibejs/ui';
import { useIdleCallback, useIntervalFn, useRafFn, useTimeoutFn } from './index.ts';

it('runs intervals without duplicates; restarts reactive delays; cannot resume after disposal', () => {
  vi.useFakeTimers();
  const ms = ref(10);
  const fn = vi.fn();
  const scope = effectScope();
  const timer = scope.run(() => useIntervalFn(fn, ms, { immediateCallback: true }))!;
  expect(fn).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(10);
  expect(fn).toHaveBeenCalledTimes(2);
  ms.value = 20;
  ms.value = 30;
  expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(30);
  expect(fn).toHaveBeenCalledTimes(5);
  timer.pause();
  ms.value = 1;
  vi.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(5);
  timer.resume();
  timer.resume();
  expect(vi.getTimerCount()).toBe(1);
  scope.stop();
  timer.resume();
  vi.runAllTimers();
  expect(timer.isActive.value).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  const paused = useIntervalFn(fn, 0, { immediate: false });
  expect(paused.isActive.value).toBe(false);
  paused.cancel();
  paused.stop();
});
it('starts, replaces, cancels and disposes timeouts', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const timer = useTimeoutFn(fn, 10);
  expect(timer.isPending.value).toBe(true);
  timer.start();
  vi.advanceTimersByTime(10);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(timer.isPending.value).toBe(false);
  timer.start();
  timer.cancel();
  vi.runAllTimers();
  expect(fn).toHaveBeenCalledTimes(1);
  timer.start();
  timer.stop();
  timer.start();
  vi.runAllTimers();
  expect(fn).toHaveBeenCalledTimes(1);
  const idle = useTimeoutFn(fn, 10, { immediate: false });
  expect(idle.isPending.value).toBe(false);
  idle.stop();
});
it('uses native RAF timestamps and deltas, supports pause inside callback and missing APIs', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  const request = vi.fn((cb: FrameRequestCallback) => {
    frames.set(++id, cb);
    return id;
  });
  const cancel = vi.fn((n: number) => {
    frames.delete(n);
  });
  const win = { requestAnimationFrame: request, cancelAnimationFrame: cancel } as unknown as Window;
  const seen: number[] = [];
  const timer = useRafFn(
    ({ delta }) => {
      seen.push(delta);
    },
    { window: win },
  );
  timer.resume();
  expect(request).toHaveBeenCalledTimes(1);
  frames.get(1)!(100);
  frames.get(2)!(116);
  expect(seen).toEqual([0, 16]);
  timer.pause();
  timer.resume();
  frames.get(4)!(200);
  expect(seen.at(-1)).toBe(0);
  const stale = frames.get(5)!;
  timer.stop();
  stale(300);
  timer.resume();
  expect(seen).toHaveLength(3);
  const missing = useRafFn(vi.fn(), { window: {} as Window, immediate: false });
  missing.resume();
  expect(missing.isSupported).toBe(false);
  missing.stop();
  const self = useRafFn(() => self.pause(), { window: win, immediate: false });
  self.resume();
  frames.get(id)!(400);
  expect(self.isActive.value).toBe(false);
  self.stop();
});
it('schedules and cancels idle work without a fabricated fallback', () => {
  let callback: IdleRequestCallback = () => {};
  const requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
    callback = cb;
    return 1;
  });
  const cancelIdleCallback = vi.fn();
  const win = { requestIdleCallback, cancelIdleCallback } as unknown as Window;
  const fn = vi.fn();
  const timer = useIdleCallback(fn, { window: win, timeout: 25 });
  expect(timer.isPending.value).toBe(true);
  const deadline = { didTimeout: false, timeRemaining: () => 5 };
  callback(deadline);
  expect(fn).toHaveBeenCalledWith(deadline);
  timer.start();
  timer.start();
  expect(cancelIdleCallback).toHaveBeenCalled();
  const stale = callback;
  timer.stop();
  stale(deadline);
  timer.start();
  expect(fn).toHaveBeenCalledTimes(1);
  const missing = useIdleCallback(fn, { window: {} as Window, immediate: false });
  missing.start();
  expect(missing.isSupported).toBe(false);
  missing.stop();
});
it('does not duplicate frames when a callback pauses and resumes the controller', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  const win = {
    requestAnimationFrame: (cb: FrameRequestCallback) => {
      frames.set(++id, cb);
      return id;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  } as unknown as Window;
  const timer = useRafFn(
    () => {
      timer.pause();
      timer.resume();
    },
    { window: win, immediate: false },
  );
  timer.resume();
  frames.get(1)!(10);
  expect(id).toBe(2);
  const stale = frames.get(2)!;
  timer.pause();
  timer.resume();
  stale(20);
  expect(id).toBe(3);
  timer.stop();
});
it('guards captured timer callbacks after disposal and uses default delays', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const intervalSpy = vi.spyOn(globalThis, 'setInterval');
  const interval = useIntervalFn(fn);
  const intervalCallback = intervalSpy.mock.calls[0][0] as () => void;
  interval.stop();
  intervalCallback();
  expect(fn).not.toHaveBeenCalled();
  const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  const timeout = useTimeoutFn(fn);
  const timeoutCallback = timeoutSpy.mock.calls[0][0] as () => void;
  timeout.stop();
  timeoutCallback();
  expect(fn).not.toHaveBeenCalled();
});
it('stops a RAF controller if its callback throws, preserving the original error', () => {
  let tick: FrameRequestCallback = () => {};
  const win = {
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      tick = callback;
      return 1;
    },
    cancelAnimationFrame: vi.fn(),
  } as unknown as Window;
  const error = new Error('frame failed');
  const raf = useRafFn(
    () => {
      throw error;
    },
    { window: win },
  );
  expect(() => tick(1)).toThrow(error);
  expect(raf.isActive.value).toBe(false);
  raf.stop();
});
