import { computed, shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { defaultDocument, defaultWindow, resource } from '../shared/resource.ts';
import type { ElementTarget } from '../shared/resource.ts';
import { useEventListener } from '../browser/events.ts';
import type { EventTargetInput } from '../browser/events.ts';
import { useResizeObserver } from './observers.ts';

export function useFocus(
  target: ElementTarget<HTMLElement>,
  options: { initialValue?: boolean; preventScroll?: boolean } = {},
) {
  return resource((_cleanup, alive) => {
    const focused = shallowRef(false);
    const update = () => {
      const element = toValue(target);
      focused.value = !!element && element.ownerDocument.activeElement === element;
    };
    useEventListener(target, 'focus', update);
    useEventListener(target, 'blur', update);
    watch(
      () => toValue(target),
      (element) => {
        if (options.initialValue) element?.focus({ preventScroll: options.preventScroll });
        update();
      },
      { immediate: true, flush: 'post' },
    );
    const set = (value: boolean) => {
      if (!alive()) return;
      const element = toValue(target);
      if (value) element?.focus({ preventScroll: options.preventScroll });
      else element?.blur();
      update();
    };
    return { focused: focused as Readonly<typeof focused>, set };
  });
}
export interface ClickOutsideOptions {
  document?: Document;
  ignore?: readonly ElementTarget[];
  /** Observe focus entering an outside element in addition to pointer clicks. */
  detectFocus?: boolean;
}
export function useClickOutside(
  target: ElementTarget,
  handler: (event: MouseEvent | FocusEvent) => void,
  options: ClickOutsideOptions = {},
) {
  return resource(() => {
    const doc = options.document ?? defaultDocument();
    const outside = (event: Event) => {
      const element = toValue(target);
      if (!element) return false;
      const path = event.composedPath();
      const inside = (node: Element) =>
        path.includes(node) || (!!event.target && node.contains(event.target as Node));
      return (
        !inside(element) &&
        !(options.ignore ?? []).some((item) => {
          const node = toValue(item);
          return node && inside(node);
        })
      );
    };
    let startedOutside = false;
    useEventListener(
      doc,
      'pointerdown',
      (event) => {
        startedOutside = event.button === 0 && outside(event);
      },
      { capture: true, passive: true },
    );
    useEventListener(
      doc,
      'click',
      (event) => {
        const trigger =
          event.button === 0 && (event.detail === 0 || startedOutside) && outside(event);
        startedOutside = false;
        if (trigger) handler(event);
      },
      { capture: true, passive: true },
    );
    if (options.detectFocus)
      useEventListener(doc, 'focusin', (event) => {
        if (outside(event)) handler(event);
      });
    return {};
  });
}

export interface ScrollOptions {
  offset?: number;
  behavior?: MaybeRefOrGetter<ScrollBehavior>;
  window?: Window;
}
export function useScroll(target: EventTargetInput<Element | Window>, options: ScrollOptions = {}) {
  return resource((_cleanup, alive) => {
    const x = shallowRef(0);
    const y = shallowRef(0);
    const maxX = shallowRef(0);
    const maxY = shallowRef(0);
    const element = (): Element | null | undefined => {
      const current = toValue(target);
      return current && 'document' in current ? current.document.scrollingElement : current;
    };
    const measure = () => {
      if (!alive()) return;
      const el = element();
      x.value = el?.scrollLeft ?? 0;
      y.value = el?.scrollTop ?? 0;
      maxX.value = el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0;
      maxY.value = el ? Math.max(0, el.scrollHeight - el.clientHeight) : 0;
    };
    useEventListener(target, 'scroll', measure, { passive: true });
    useEventListener(options.window ?? defaultWindow(), 'resize', measure, { passive: true });
    useResizeObserver(element, measure);
    watch(() => toValue(target), measure, { immediate: true, flush: 'post' });
    const scrollTo = (position: { x?: number; y?: number; behavior?: ScrollBehavior }) => {
      if (!alive()) return;
      element()?.scrollTo({
        left: position.x ?? x.value,
        top: position.y ?? y.value,
        behavior: position.behavior ?? toValue(options.behavior ?? 'auto'),
      });
      measure();
    };
    const threshold = options.offset ?? 1;
    return {
      x: x as Readonly<typeof x>,
      y: y as Readonly<typeof y>,
      maxX: maxX as Readonly<typeof maxX>,
      maxY: maxY as Readonly<typeof maxY>,
      arrivedState: computed(() => ({
        left: x.value <= threshold,
        right: x.value >= maxX.value - threshold,
        top: y.value <= threshold,
        bottom: y.value >= maxY.value - threshold,
      })),
      measure,
      scrollTo,
    };
  });
}
