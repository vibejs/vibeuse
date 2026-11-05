import { shallowRef, toValue, watch } from '@usevibejs/ui';
import { defaultWindow, resource } from '../shared/resource.ts';
import { useEventListener, type EventTargetInput } from '../browser/events.ts';
import { useResizeObserver } from './observers.ts';

export type ScrollEdge = 'top' | 'bottom' | 'left' | 'right';
export interface InfiniteScrollOptions {
  /** CSS pixels from the edge that still count as arrived. Default 0. */
  distance?: number;
  /** Edge that loads another page. Default `bottom`. */
  direction?: ScrollEdge;
  /** Minimum delay before another automatic load. Default 0. */
  interval?: number;
  /** Return false to keep the loader idle. Read on each check. */
  canLoadMore?: () => boolean;
  window?: Window;
}

function scrollElement(target: EventTargetInput<Element | Window>): Element | null | undefined {
  const current = toValue(target);
  if (!current) return current;
  return 'document' in current ? (current.document.scrollingElement ?? undefined) : current;
}

/**
 * Calls `onLoadMore` when a scrollable element is within `distance` of one edge.
 * A rejected load is stored on `error` and does not escape the scroll listener.
 * The list itself stays in the application.
 */
export function useInfiniteScroll(
  target: EventTargetInput<Element | Window>,
  onLoadMore: () => void | Promise<void>,
  options: InfiniteScrollOptions = {},
) {
  return resource((cleanup, alive) => {
    const direction = options.direction ?? 'bottom';
    const distance = Math.max(0, options.distance ?? 0);
    const interval = Math.max(0, options.interval ?? 0);
    const isLoading = shallowRef(false);
    const error = shallowRef<unknown>();
    let pending = false;
    let seen = '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    let holdUntil = 0;
    const element = () => scrollElement(target);
    const arrived = (el: Element) => {
      const remain =
        direction === 'top'
          ? el.scrollTop
          : direction === 'left'
            ? el.scrollLeft
            : direction === 'right'
              ? el.scrollWidth - el.clientWidth - el.scrollLeft
              : el.scrollHeight - el.clientHeight - el.scrollTop;
      return remain <= distance;
    };
    const signature = (el: Element) =>
      [
        el.scrollLeft,
        el.scrollTop,
        el.scrollWidth,
        el.scrollHeight,
        el.clientWidth,
        el.clientHeight,
      ].join(':');
    const later = (ms: number) => {
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        check();
      }, ms);
    };
    const check = () => {
      if (!alive() || pending) return;
      const now = Date.now();
      if (now < holdUntil) {
        later(holdUntil - now);
        return;
      }
      const el = element();
      if (!el) return;
      if (options.canLoadMore && !options.canLoadMore()) return;
      if (!arrived(el)) return;
      pending = true;
      isLoading.value = true;
      error.value = undefined;
      seen = signature(el);
      holdUntil = Date.now() + interval;
      void Promise.resolve()
        .then(() => onLoadMore())
        .catch((cause: unknown) => {
          if (alive()) error.value = cause;
        })
        .finally(() => {
          pending = false;
          if (!alive()) return;
          isLoading.value = false;
          const next = element();
          if (!next || signature(next) === seen) return;
          if (interval > 0) later(interval);
          else check();
        });
    };
    cleanup(() => {
      clearTimeout(timer);
      timer = undefined;
      pending = false;
      isLoading.value = false;
    });
    useEventListener(target, 'scroll', check, { passive: true });
    useEventListener(options.window ?? defaultWindow(), 'resize', check, { passive: true });
    useResizeObserver(
      () => element() ?? null,
      () => {
        check();
      },
    );
    watch(() => toValue(target), check, { immediate: true, flush: 'post' });
    return {
      isLoading: isLoading as Readonly<typeof isLoading>,
      error: error as Readonly<typeof error>,
      check,
    };
  });
}
