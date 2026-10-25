import { shallowRef, toValue, watch } from '@usevibejs/ui';
import type { MaybeRefOrGetter } from '@usevibejs/ui';
import { defaultWindow, resource } from '../shared/resource.ts';
import { useEventListener } from '../browser/events.ts';

export interface StorageSerializer<T> {
  read(raw: string): T;
  write(value: T): string;
}
export interface StorageOptions<T> {
  storage?: Storage;
  window?: Window;
  serializer?: StorageSerializer<T>;
  /** Defaults to synchronous writes. Manual mode persists only on write(). */
  flush?: 'sync' | 'pre' | 'post' | 'manual';
  writeDefaults?: boolean;
  listenToStorageChanges?: boolean;
  onError?: (error: unknown) => void;
}

/** Replacement-based persistence: assign data.value to persist changes to objects. */
function createStorage<T>(
  key: MaybeRefOrGetter<string>,
  defaults: T,
  options: StorageOptions<T>,
  area: 'localStorage' | 'sessionStorage',
) {
  return resource((_cleanup, alive) => {
    const win = options.window ?? defaultWindow();
    const error = shallowRef<unknown>();
    const fail = (cause: unknown) => {
      error.value = cause;
      options.onError?.(cause);
    };
    let storage: Storage | undefined = options.storage;
    if (!storage) {
      try {
        storage = win?.[area];
      } catch (cause) {
        fail(cause);
      }
    }
    const isSupported = !!storage;
    const serializer: StorageSerializer<T> = options.serializer ?? {
      read: (raw) => JSON.parse(raw) as T,
      write: (value) => {
        const raw = JSON.stringify(value);
        if (raw === undefined) throw new TypeError('Value requires a custom storage serializer.');
        return raw;
      },
    };
    const data = shallowRef<T>(defaults);
    let syncing = false;
    const assign = (value: T) => {
      syncing = true;
      try {
        data.value = value;
      } finally {
        syncing = false;
      }
    };
    // Last observed state avoids echoing queued writes after a storage event or key switch.
    let observed = data.value;
    const write = () => {
      if (!alive() || !storage) return;
      try {
        const name = toValue(key);
        const raw = data.value === undefined ? null : serializer.write(data.value);
        if (storage.getItem(name) !== raw) {
          if (raw === null) storage.removeItem(name);
          else storage.setItem(name, raw);
        }
        observed = data.value;
        error.value = undefined;
      } catch (cause) {
        fail(cause);
      }
    };
    const read = () => {
      if (!alive() || !storage) return;
      try {
        const raw = storage.getItem(toValue(key));
        assign(raw === null ? defaults : serializer.read(raw));
        observed = data.value;
        error.value = undefined;
        if (raw === null && options.writeDefaults) write();
      } catch (cause) {
        fail(cause);
      }
    };
    read();
    if (options.flush !== 'manual')
      watch(
        data,
        () => {
          if (!syncing && !Object.is(data.value, observed)) write();
        },
        { flush: options.flush ?? 'sync' },
      );
    watch(
      () => toValue(key),
      () => {
        assign(defaults);
        observed = data.value;
        read();
      },
      { flush: 'sync' },
    );
    if (options.listenToStorageChanges !== false)
      useEventListener(win, 'storage', (event) => {
        if (event.storageArea !== storage || (event.key !== null && event.key !== toValue(key)))
          return;
        // Read the event payload: another write can race with the asynchronous browser event.
        try {
          assign(event.newValue === null ? defaults : serializer.read(event.newValue));
          observed = data.value;
          error.value = undefined;
        } catch (cause) {
          fail(cause);
        }
      });
    const remove = () => {
      if (!alive()) return;
      try {
        storage?.removeItem(toValue(key));
        assign(defaults);
        observed = data.value;
        error.value = undefined;
      } catch (cause) {
        fail(cause);
      }
    };
    return {
      data,
      error: error as Readonly<typeof error>,
      isSupported,
      write,
      read,
      remove,
      reset: () => {
        if (alive()) {
          assign(defaults);
          write();
        }
      },
    };
  });
}
export function useStorage<T>(
  key: MaybeRefOrGetter<string>,
  defaults: T,
  options: StorageOptions<T> = {},
) {
  return createStorage(key, defaults, options, 'localStorage');
}
export function useLocalStorage<T>(
  key: MaybeRefOrGetter<string>,
  defaults: T,
  options: StorageOptions<T> = {},
) {
  return createStorage(key, defaults, options, 'localStorage');
}
export function useSessionStorage<T>(
  key: MaybeRefOrGetter<string>,
  defaults: T,
  options: StorageOptions<T> = {},
) {
  return createStorage(key, defaults, options, 'sessionStorage');
}
