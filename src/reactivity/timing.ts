import { shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { delay } from '../core/timing.ts';
import { resource } from '../shared/resource.ts';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}
export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/** Scheduled calls return void; flush returns the most recent callback result. */
export function useDebounceFn<A extends unknown[], R>(
  fn: (...args: A) => R,
  ms: MaybeRefOrGetter<number> = 200,
  options: DebounceOptions = {},
) {
  return resource((cleanup, alive) => {
    const isPending = shallowRef(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let maxTimer: ReturnType<typeof setTimeout> | undefined;
    let args: A | undefined;
    let result: R | undefined;
    const invoke = () => {
      const current = args;
      args = undefined;
      if (current && alive()) result = fn(...current);
      return result;
    };
    const cancel = () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
      timer = maxTimer = undefined;
      args = undefined;
      isPending.value = false;
    };
    const flush = () => {
      const pending = args;
      cancel();
      args = pending;
      return invoke();
    };
    const call = (...next: A): void => {
      if (!alive()) return;
      const first = timer === undefined;
      args = next;
      clearTimeout(timer);
      isPending.value = true;
      timer = setTimeout(
        () => {
          if (options.trailing !== false) flush();
          else cancel();
        },
        delay(toValue(ms)),
      );
      if (first && options.maxWait !== undefined)
        maxTimer = setTimeout(flush, delay(options.maxWait));
      if (first && options.leading) invoke();
    };
    cleanup(cancel);
    return { call, cancel, flush, isPending: isPending as Readonly<typeof isPending> };
  });
}

export function useThrottleFn<A extends unknown[], R>(
  fn: (...args: A) => R,
  ms: MaybeRefOrGetter<number> = 200,
  options: ThrottleOptions = {},
) {
  return resource((cleanup, alive) => {
    const isPending = shallowRef(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let args: A | undefined;
    let result: R | undefined;
    const invoke = () => {
      const current = args;
      args = undefined;
      if (current && alive()) result = fn(...current);
      return result;
    };
    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
      args = undefined;
      isPending.value = false;
    };
    const flush = () => {
      const pending = args;
      cancel();
      args = pending;
      return invoke();
    };
    const call = (...next: A): void => {
      if (!alive()) return;
      args = next;
      if (timer !== undefined) return;
      isPending.value = true;
      timer = setTimeout(
        () => {
          if (options.trailing !== false) flush();
          else cancel();
        },
        delay(toValue(ms)),
      );
      if (options.leading !== false) invoke();
    };
    cleanup(cancel);
    return { call, cancel, flush, isPending: isPending as Readonly<typeof isPending> };
  });
}

export function useDebounce<T>(
  source: MaybeRefOrGetter<T>,
  ms: MaybeRefOrGetter<number> = 200,
  options: DebounceOptions = {},
) {
  return resource(() => {
    const value = shallowRef<T>(toValue(source));
    const filter = useDebounceFn(
      (next: T) => {
        value.value = next;
      },
      ms,
      options,
    );
    watch(() => toValue(source), filter.call, { flush: 'sync' });
    return {
      value: value as Readonly<typeof value>,
      cancel: filter.cancel,
      flush: filter.flush,
      isPending: filter.isPending,
    };
  });
}
export function useThrottle<T>(
  source: MaybeRefOrGetter<T>,
  ms: MaybeRefOrGetter<number> = 200,
  options: ThrottleOptions = {},
) {
  return resource(() => {
    const value = shallowRef<T>(toValue(source));
    const filter = useThrottleFn(
      (next: T) => {
        value.value = next;
      },
      ms,
      options,
    );
    watch(() => toValue(source), filter.call, { flush: 'sync' });
    return {
      value: value as Readonly<typeof value>,
      cancel: filter.cancel,
      flush: filter.flush,
      isPending: filter.isPending,
    };
  });
}
