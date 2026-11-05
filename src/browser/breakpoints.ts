import { computed, shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { defaultWindow, resource } from '../shared/resource.ts';

export interface UseBreakpointsOptions {
  window?: Window;
  /** Names treated as active when matchMedia is missing. Names outside the map are dropped. */
  fallback?: readonly string[];
}

function ordered(map: Readonly<Record<string, number>>): Array<[string, number]> {
  return Object.entries(map)
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1]),
    )
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
}

/** Tracks min-width breakpoints. `current` is the largest match. There is no SSR snapshot. */
export function useBreakpoints(
  breakpoints: MaybeRefOrGetter<Readonly<Record<string, number>>>,
  options: UseBreakpointsOptions = {},
) {
  return resource(() => {
    const win = options.window ?? defaultWindow();
    const isSupported = !!win?.matchMedia;
    const active = shallowRef<readonly string[]>([]);
    watch(
      () => ordered(toValue(breakpoints)),
      (list, _previous, cleanup) => {
        if (!isSupported) {
          const allowed = new Set(options.fallback ?? []);
          active.value = list.filter(([name]) => allowed.has(name)).map(([name]) => name);
          return;
        }
        const pairs = list.map(([name, width]) => ({
          name,
          media: win!.matchMedia(`(min-width: ${width}px)`),
        }));
        const update = () => {
          active.value = pairs.filter((pair) => pair.media.matches).map((pair) => pair.name);
        };
        for (const pair of pairs) pair.media.addEventListener('change', update);
        update();
        cleanup(() => {
          for (const pair of pairs) pair.media.removeEventListener('change', update);
        });
      },
      { immediate: true, flush: 'sync' },
    );
    const rank = (name: string) => ordered(toValue(breakpoints)).findIndex(([key]) => key === name);
    const greater = (name: string) => {
      const index = rank(name);
      if (index < 0) return false;
      return active.value.some((key) => rank(key) > index);
    };
    const smaller = (name: string) => {
      const index = rank(name);
      if (index < 0) return false;
      const current = active.value.at(-1);
      return (current === undefined ? -1 : rank(current)) < index;
    };
    const matches = (name: string) => active.value.includes(name);
    return {
      active: active as Readonly<typeof active>,
      current: computed(() => active.value.at(-1)),
      isSupported,
      matches,
      greater,
      smaller,
      between: (min: string, max: string) => matches(min) && smaller(max),
    };
  });
}
