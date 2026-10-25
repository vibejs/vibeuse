import { toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { resource } from '../shared/resource.ts';

export type EventTargetInput<T extends EventTarget = EventTarget> = MaybeRefOrGetter<
  T | null | undefined
>;
type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;
export function useEventListener<T extends EventTarget, K extends keyof EventMap<T> & string>(
  target: EventTargetInput<T>,
  event: K,
  listener: (event: EventMap<T>[K]) => void,
  options?: AddEventListenerOptions | boolean,
): { stop(): void };
export function useEventListener(
  target: EventTargetInput,
  event: string,
  listener: EventListener,
  options?: AddEventListenerOptions | boolean,
): { stop(): void };
export function useEventListener(
  target: EventTargetInput,
  event: string,
  listener: EventListener,
  options?: AddEventListenerOptions | boolean,
) {
  return resource(() => {
    // Capture mutable option objects so removal uses exactly the original capture mode.
    const opts = typeof options === 'object' ? { ...options } : options;
    watch(
      () => toValue(target),
      (current, _old, cleanup) => {
        if (!current) return;
        current.addEventListener(event, listener, opts);
        cleanup(() => current.removeEventListener(event, listener, opts));
      },
      { immediate: true, flush: 'sync' },
    );
    return {};
  });
}
