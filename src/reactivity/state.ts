import {
  computed,
  getCurrentScope,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
} from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { clamp } from '../core/timing.ts';
import { resource } from '../shared/resource.ts';

export function usePrevious<T>(source: MaybeRefOrGetter<T>, initial?: T) {
  return resource(() => {
    const previous = shallowRef<T | undefined>(initial);
    watch(
      () => toValue(source),
      (_value, old) => {
        previous.value = old;
      },
      { flush: 'sync' },
    );
    return { previous: previous as Readonly<typeof previous> };
  });
}
export interface CounterOptions {
  min?: number;
  max?: number;
}
export function useCounter(initial = 0, { min = -Infinity, max = Infinity }: CounterOptions = {}) {
  if (min > max) throw new RangeError('Counter min must not exceed max.');
  const count = shallowRef(clamp(initial, min, max));
  const set = (value: number) => {
    count.value = clamp(value, min, max);
  };
  return {
    count: count as Readonly<typeof count>,
    set,
    inc: (delta = 1) => set(count.value + delta),
    dec: (delta = 1) => set(count.value - delta),
    reset: () => set(initial),
  };
}
export function useToggle(initial = false) {
  const value = shallowRef(initial);
  const set = (next: boolean) => {
    value.value = next;
  };
  return {
    value: value as Readonly<typeof value>,
    set,
    toggle: () => {
      value.value = !value.value;
      return value.value;
    },
  };
}
export function useCycle<T>(values: MaybeRefOrGetter<readonly T[]>, initialIndex = 0) {
  const index = shallowRef(initialIndex);
  const normalized = computed(() => {
    const length = toValue(values).length;
    return length ? ((index.value % length) + length) % length : -1;
  });
  const state = computed((): T | undefined => toValue(values)[normalized.value]);
  const next = (delta = 1) => {
    index.value = normalized.value + delta;
  };
  return {
    state,
    index: normalized,
    next,
    prev: (delta = 1) => next(-delta),
    reset: () => {
      index.value = initialIndex;
    },
  };
}

/** Each call creates an isolated bus. Share this returned object explicitly or via provide/inject. */
export function useEventBus<T>() {
  return resource((cleanup, alive) => {
    const listeners = new Set<(event: T) => void>();
    const on = (listener: (event: T) => void) => {
      if (alive()) listeners.add(listener);
      const off = () => {
        listeners.delete(listener);
      };
      if (getCurrentScope()) onScopeDispose(off);
      return off;
    };
    cleanup(() => listeners.clear());
    return {
      on,
      emit: (event: T) => {
        if (alive())
          for (const listener of Array.from(listeners))
            if (listeners.has(listener)) listener(event);
      },
      clear: () => listeners.clear(),
    };
  });
}
