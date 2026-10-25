import { shallowRef, toValue, watch } from '@usevibejs/ui';
import { defaultWindow, resource } from '../shared/resource.ts';
import type { ElementTarget } from '../shared/resource.ts';
import { useEventListener } from '../browser/events.ts';
import { useResizeObserver } from './observers.ts';

/** Content-box size in CSS pixels; disconnected elements reset to zero. */
export function useElementSize(target: ElementTarget, initial = { width: 0, height: 0 }) {
  return resource(() => {
    const width = shallowRef(initial.width);
    const height = shallowRef(initial.height);
    const update = () => {
      const element = toValue(target);
      const rect = element?.isConnected ? element.getBoundingClientRect() : undefined;
      const style =
        rect && element ? element.ownerDocument.defaultView?.getComputedStyle(element) : undefined;
      const number = (value?: string) => Number.parseFloat(value ?? '') || 0;
      width.value = rect
        ? Math.max(
            0,
            rect.width -
              number(style?.paddingLeft) -
              number(style?.paddingRight) -
              number(style?.borderLeftWidth) -
              number(style?.borderRightWidth),
          )
        : 0;
      height.value = rect
        ? Math.max(
            0,
            rect.height -
              number(style?.paddingTop) -
              number(style?.paddingBottom) -
              number(style?.borderTopWidth) -
              number(style?.borderBottomWidth),
          )
        : 0;
    };
    watch(() => toValue(target), update, { immediate: true, flush: 'post' });
    useResizeObserver(target, (entries) => {
      const element = toValue(target);
      const entry = entries.find((value) => value.target === element);
      if (entry) {
        width.value = element?.isConnected ? entry.contentRect.width : 0;
        height.value = element?.isConnected ? entry.contentRect.height : 0;
      }
    });
    return { width: width as Readonly<typeof width>, height: height as Readonly<typeof height> };
  });
}
export function useElementBounding(
  target: ElementTarget,
  options: { window?: Window; windowScroll?: boolean; windowResize?: boolean } = {},
) {
  return resource((_cleanup, alive) => {
    const x = shallowRef(0);
    const y = shallowRef(0);
    const width = shallowRef(0);
    const height = shallowRef(0);
    const top = shallowRef(0);
    const right = shallowRef(0);
    const bottom = shallowRef(0);
    const left = shallowRef(0);
    const update = () => {
      if (!alive()) return;
      const element = toValue(target);
      const rect = element?.isConnected ? element.getBoundingClientRect() : undefined;
      x.value = rect?.x ?? 0;
      y.value = rect?.y ?? 0;
      width.value = rect?.width ?? 0;
      height.value = rect?.height ?? 0;
      top.value = rect?.top ?? 0;
      right.value = rect?.right ?? 0;
      bottom.value = rect?.bottom ?? 0;
      left.value = rect?.left ?? 0;
    };
    watch(() => toValue(target), update, { immediate: true, flush: 'post' });
    useResizeObserver(target, update);
    const win = options.window ?? defaultWindow();
    if (options.windowResize !== false) useEventListener(win, 'resize', update, { passive: true });
    if (options.windowScroll !== false)
      useEventListener(win, 'scroll', update, { passive: true, capture: true });
    return {
      x: x as Readonly<typeof x>,
      y: y as Readonly<typeof y>,
      width: width as Readonly<typeof width>,
      height: height as Readonly<typeof height>,
      top: top as Readonly<typeof top>,
      right: right as Readonly<typeof right>,
      bottom: bottom as Readonly<typeof bottom>,
      left: left as Readonly<typeof left>,
      update,
    };
  });
}
