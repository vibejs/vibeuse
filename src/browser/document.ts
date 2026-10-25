import { computed, shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { defaultDocument, resource } from '../shared/resource.ts';
import type { ElementTarget } from '../shared/resource.ts';
import { useLocalStorage } from '../storage/index.ts';
import { usePreferredDark } from './state.ts';

export type ColorPreference = 'auto' | 'light' | 'dark';
export interface DarkOptions {
  /** No element is changed unless a target is explicitly provided. */
  target?: ElementTarget;
  className?: string;
  initialValue?: ColorPreference;
  /** Persistence is opt-in. */
  storageKey?: string;
  storage?: Storage;
  window?: Window;
}
export function useDark(options: DarkOptions = {}) {
  return resource((cleanup) => {
    const system = usePreferredDark({ window: options.window });
    const saved = options.storageKey
      ? useLocalStorage<ColorPreference>(options.storageKey, options.initialValue ?? 'auto', {
          storage: options.storage,
          window: options.window,
          serializer: {
            read: (raw) => {
              const value: unknown = JSON.parse(raw);
              if (value === 'auto' || value === 'light' || value === 'dark') return value;
              throw new TypeError('Invalid color preference.');
            },
            write: JSON.stringify,
          },
        })
      : undefined;
    const preference = saved?.data ?? shallowRef<ColorPreference>(options.initialValue ?? 'auto');
    const isDark = computed(() =>
      preference.value === 'auto' ? system.matches.value : preference.value === 'dark',
    );
    if (options.target !== undefined) {
      const name = options.className ?? 'dark';
      let current: Element | null | undefined;
      let original = false;
      const restore = () => {
        current?.classList.toggle(name, original);
      };
      watch(
        () => [toValue(options.target), isDark.value] as const,
        ([target, dark]) => {
          if (target !== current) {
            restore();
            current = target;
            original = target?.classList.contains(name) ?? false;
          }
          target?.classList.toggle(name, dark);
        },
        { immediate: true, flush: 'sync' },
      );
      cleanup(restore);
    }
    return {
      preference,
      isDark,
      error: saved?.error,
      set: (value: ColorPreference) => {
        preference.value = value;
      },
      toggle: () => {
        preference.value = isDark.value ? 'light' : 'dark';
      },
    };
  });
}
export function useTitle(
  title: MaybeRefOrGetter<string>,
  options: { document?: Document; restoreOnStop?: boolean } = {},
) {
  return resource((cleanup) => {
    const doc = options.document ?? defaultDocument();
    const original = doc?.title;
    watch(
      () => toValue(title),
      (value) => {
        if (doc) doc.title = value;
      },
      { immediate: true, flush: 'sync' },
    );
    if (options.restoreOnStop !== false)
      cleanup(() => {
        if (doc) doc.title = original!;
      });
    return {};
  });
}
export function useFavicon(
  href: MaybeRefOrGetter<string | null>,
  options: { document?: Document; rel?: string } = {},
) {
  return resource((cleanup) => {
    const doc = options.document ?? defaultDocument();
    const rel = options.rel ?? 'icon';
    const existing = doc
      ? [...doc.querySelectorAll<HTMLLinkElement>('link')].find((link) => link.rel === rel)
      : undefined;
    const original = existing?.getAttribute('href');
    let link = existing;
    watch(
      () => toValue(href),
      (value) => {
        if (!doc) return;
        if (!link && value !== null) {
          link = doc.createElement('link');
          link.rel = rel;
          doc.head.append(link);
        }
        if (link) {
          if (value === null) link.removeAttribute('href');
          else link.setAttribute('href', value);
        }
      },
      { immediate: true, flush: 'sync' },
    );
    cleanup(() => {
      if (!existing) link?.remove();
      else if (original === null) existing.removeAttribute('href');
      else existing.setAttribute('href', original!);
    });
    return {};
  });
}
