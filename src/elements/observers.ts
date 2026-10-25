import { shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { resource } from '../shared/resource.ts';
import type { ElementTarget } from '../shared/resource.ts';

function observe<T extends Node>(
  target: MaybeRefOrGetter<T | null | undefined>,
  supported: boolean,
  connect: (target: T, alive: () => boolean) => { disconnect(): void },
) {
  return resource((cleanup, alive) => {
    const isActive = shallowRef(true);
    watch(
      () => [toValue(target), isActive.value] as const,
      ([node, active], _old, onCleanup) => {
        if (!node || !active || !supported) return;
        let connected = true;
        const observer = connect(
          node,
          () => alive() && connected && isActive.value && toValue(target) === node,
        );
        onCleanup(() => {
          connected = false;
          observer.disconnect();
        });
      },
      { immediate: true, flush: 'post' },
    );
    cleanup(() => {
      isActive.value = false;
    });
    return {
      isSupported: supported,
      isActive: isActive as Readonly<typeof isActive>,
      pause: () => {
        isActive.value = false;
      },
      resume: () => {
        if (alive()) isActive.value = true;
      },
    };
  });
}
export function useResizeObserver(
  target: ElementTarget,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
) {
  return observe(target, typeof ResizeObserver !== 'undefined', (element, alive) => {
    const observer = new ResizeObserver((entries, instance) => {
      if (alive()) callback(entries, instance);
    });
    observer.observe(element, options);
    return observer;
  });
}
export function useIntersectionObserver(
  target: ElementTarget,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) {
  return observe(target, typeof IntersectionObserver !== 'undefined', (element, alive) => {
    const observer = new IntersectionObserver((entries, instance) => {
      if (alive()) callback(entries, instance);
    }, options);
    observer.observe(element);
    return observer;
  });
}
export function useMutationObserver(
  target: MaybeRefOrGetter<Node | null | undefined>,
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
) {
  return observe(target, typeof MutationObserver !== 'undefined', (node, alive) => {
    const observer = new MutationObserver((entries, instance) => {
      if (alive()) callback(entries, instance);
    });
    observer.observe(node, options);
    return observer;
  });
}
