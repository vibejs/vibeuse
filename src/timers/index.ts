import { shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { delay } from '../core/timing.ts';
import { defaultWindow, resource } from '../shared/resource.ts';

export interface IntervalOptions {
  immediate?: boolean;
  immediateCallback?: boolean;
}
export function useIntervalFn(
  callback: () => void,
  ms: MaybeRefOrGetter<number> = 1000,
  options: IntervalOptions = {},
) {
  return resource((cleanup, alive) => {
    const isActive = shallowRef(false);
    let timer: ReturnType<typeof setInterval> | undefined;
    const pause = () => {
      clearInterval(timer);
      timer = undefined;
      isActive.value = false;
    };
    const resume = () => {
      if (!alive()) return;
      pause();
      isActive.value = true;
      timer = setInterval(
        () => {
          if (alive()) callback();
        },
        Math.max(1, delay(toValue(ms))),
      );
      if (options.immediateCallback) callback();
    };
    watch(
      () => toValue(ms),
      () => {
        if (isActive.value) resume();
      },
      { flush: 'sync' },
    );
    cleanup(pause);
    if (options.immediate !== false) resume();
    return { isActive: isActive as Readonly<typeof isActive>, pause, resume, cancel: pause };
  });
}

export function useTimeoutFn(
  callback: () => void,
  ms: MaybeRefOrGetter<number> = 1000,
  options: { immediate?: boolean } = {},
) {
  return resource((cleanup, alive) => {
    const isPending = shallowRef(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
      isPending.value = false;
    };
    const start = () => {
      if (!alive()) return;
      cancel();
      isPending.value = true;
      timer = setTimeout(
        () => {
          if (!alive()) return;
          isPending.value = false;
          timer = undefined;
          callback();
        },
        delay(toValue(ms)),
      );
    };
    cleanup(cancel);
    if (options.immediate !== false) start();
    return { isPending: isPending as Readonly<typeof isPending>, start, cancel };
  });
}

export interface RafFrame {
  timestamp: number;
  delta: number;
}
export function useRafFn(
  callback: (frame: RafFrame) => void,
  options: { immediate?: boolean; window?: Window } = {},
) {
  return resource((cleanup, alive) => {
    const win = options.window ?? defaultWindow();
    const isSupported = !!win?.requestAnimationFrame;
    const isActive = shallowRef(false);
    let id: number | undefined;
    let previous: number | undefined;
    let generation = 0;
    const frame = { timestamp: 0, delta: 0 };
    const tick = (timestamp: number, token: number) => {
      if (!alive() || !isActive.value || token !== generation) return;
      id = undefined;
      frame.timestamp = timestamp;
      frame.delta = previous === undefined ? 0 : timestamp - previous;
      previous = timestamp;
      try {
        callback(frame);
      } catch (error) {
        pause();
        throw error;
      }
      if (alive() && isActive.value && token === generation)
        id = win!.requestAnimationFrame((time) => tick(time, token));
    };
    const pause = () => {
      generation++;
      if (id !== undefined) win?.cancelAnimationFrame(id);
      id = undefined;
      previous = undefined;
      isActive.value = false;
    };
    const resume = () => {
      if (!alive() || !isSupported || isActive.value) return;
      isActive.value = true;
      const token = ++generation;
      id = win!.requestAnimationFrame((time) => tick(time, token));
    };
    cleanup(pause);
    if (options.immediate !== false) resume();
    return {
      isSupported,
      isActive: isActive as Readonly<typeof isActive>,
      pause,
      resume,
      cancel: pause,
    };
  });
}

export function useIdleCallback(
  callback: IdleRequestCallback,
  options: { immediate?: boolean; timeout?: number; window?: Window } = {},
) {
  return resource((cleanup, alive) => {
    const win = options.window ?? defaultWindow();
    const isSupported = !!win?.requestIdleCallback;
    const isPending = shallowRef(false);
    let id: number | undefined;
    const cancel = () => {
      if (id !== undefined) win?.cancelIdleCallback(id);
      id = undefined;
      isPending.value = false;
    };
    const start = () => {
      if (!alive() || !isSupported) return;
      cancel();
      isPending.value = true;
      id = win!.requestIdleCallback(
        (deadline) => {
          id = undefined;
          if (!alive()) return;
          isPending.value = false;
          callback(deadline);
        },
        { timeout: options.timeout },
      );
    };
    cleanup(cancel);
    if (options.immediate !== false) start();
    return { isSupported, isPending: isPending as Readonly<typeof isPending>, start, cancel };
  });
}
