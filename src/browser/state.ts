import { computed, shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { defaultDocument, defaultNavigator, defaultWindow, resource } from '../shared/resource.ts';
import { useEventListener } from './events.ts';

export function useWindowSize(
  options: { window?: Window; initialWidth?: number; initialHeight?: number } = {},
) {
  return resource(() => {
    const win = options.window ?? defaultWindow();
    const width = shallowRef(win?.innerWidth ?? options.initialWidth ?? 0);
    const height = shallowRef(win?.innerHeight ?? options.initialHeight ?? 0);
    if (win)
      useEventListener(
        win,
        'resize',
        () => {
          width.value = win.innerWidth;
          height.value = win.innerHeight;
        },
        { passive: true },
      );
    return { width: width as Readonly<typeof width>, height: height as Readonly<typeof height> };
  });
}
export function useMediaQuery(
  query: MaybeRefOrGetter<string>,
  options: { window?: Window; initialValue?: boolean } = {},
) {
  return resource(() => {
    const win = options.window ?? defaultWindow();
    const matches = shallowRef(options.initialValue ?? false);
    const isSupported = !!win?.matchMedia;
    watch(
      () => toValue(query),
      (value, _old, cleanup) => {
        if (!isSupported) return;
        const media = win!.matchMedia(value);
        const update = () => {
          matches.value = media.matches;
        };
        update();
        media.addEventListener('change', update);
        cleanup(() => media.removeEventListener('change', update));
      },
      { immediate: true, flush: 'sync' },
    );
    return { matches: matches as Readonly<typeof matches>, isSupported };
  });
}
export function usePreferredDark(options: { window?: Window; initialValue?: boolean } = {}) {
  return useMediaQuery('(prefers-color-scheme: dark)', options);
}
export function useDocumentVisibility(doc: Document | undefined = defaultDocument()) {
  return resource(() => {
    const visibility = shallowRef<DocumentVisibilityState>(doc?.visibilityState ?? 'visible');
    useEventListener(doc, 'visibilitychange', () => {
      visibility.value = doc!.visibilityState;
    });
    return { visibility: visibility as Readonly<typeof visibility> };
  });
}
export function useOnline(win: Window | undefined = defaultWindow()) {
  return resource(() => {
    const isOnline = shallowRef(win?.navigator.onLine ?? true);
    useEventListener(win, 'online', () => {
      isOnline.value = true;
    });
    useEventListener(win, 'offline', () => {
      isOnline.value = false;
    });
    return { isOnline: isOnline as Readonly<typeof isOnline> };
  });
}
export function useSupported(check: () => boolean) {
  const isSupported = computed(() => {
    try {
      return !!check();
    } catch {
      return false;
    }
  });
  return { isSupported };
}
export function useClipboard(options: { navigator?: Navigator } = {}) {
  return resource((_cleanup, alive) => {
    const nav = options.navigator ?? defaultNavigator();
    const isSupported = !!nav?.clipboard?.writeText;
    const text = shallowRef('');
    const copied = shallowRef(false);
    const error = shallowRef<unknown>();
    const isPending = shallowRef(false);
    let request = 0;
    const copy = async (value: string): Promise<boolean> => {
      if (!alive()) return false;
      const id = ++request;
      copied.value = false;
      error.value = undefined;
      isPending.value = true;
      try {
        if (!isSupported)
          throw new Error(
            'Clipboard writing is unavailable. Use a secure context and a user gesture.',
          );
        await nav!.clipboard.writeText(value);
        if (!alive() || id !== request) return false;
        text.value = value;
        copied.value = true;
        return true;
      } catch (cause) {
        if (alive() && id === request) error.value = cause;
        return false;
      } finally {
        if (alive() && id === request) isPending.value = false;
      }
    };
    return {
      copy,
      isSupported,
      text: text as Readonly<typeof text>,
      copied: copied as Readonly<typeof copied>,
      error: error as Readonly<typeof error>,
      isPending: isPending as Readonly<typeof isPending>,
    };
  });
}
export function usePermission(
  descriptor: PermissionDescriptor,
  options: { navigator?: Navigator } = {},
) {
  return resource((cleanup, alive) => {
    const nav = options.navigator ?? defaultNavigator();
    const isSupported = !!nav?.permissions?.query;
    const state = shallowRef<PermissionState | 'unsupported' | 'unknown'>(
      isSupported ? 'unknown' : 'unsupported',
    );
    const error = shallowRef<unknown>();
    let remove = () => {};
    let request = 0;
    const query = async () => {
      if (!alive() || !isSupported) return;
      const id = ++request;
      try {
        const status = await nav!.permissions.query(descriptor);
        if (!alive() || id !== request) return;
        remove();
        error.value = undefined;
        const update = () => {
          if (alive()) state.value = status.state;
        };
        update();
        status.addEventListener('change', update);
        remove = () => status.removeEventListener('change', update);
      } catch (cause) {
        if (alive() && id === request) {
          error.value = cause;
          state.value = 'unknown';
        }
      }
    };
    cleanup(() => remove());
    void query();
    return {
      state: state as Readonly<typeof state>,
      error: error as Readonly<typeof error>,
      isSupported,
      query,
    };
  });
}
