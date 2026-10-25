# useSessionStorage

Persist local reactive state for this browser session.

[Open the interactive .vibe example](#/functions/useSessionStorage)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useSessionStorage } from '@usevibejs/use';

const preferences = useSessionStorage('preferences', { compact: false });
preferences.data.value = { compact: true };
```

## Signature

Generated from the built public declarations.

```ts
declare function useSessionStorage<T>(key: MaybeRefOrGetter<string>, defaults: T, options?: StorageOptions<T>): {
  data: import("@usevibejs/ui").Ref<any, any> extends T ? T extends T & import("@usevibejs/ui").Ref<any, any> ? 0 extends 1 & T ? import("@usevibejs/ui").ShallowRef<T, T> : T : import("@usevibejs/ui").ShallowRef<T, T> : import("@usevibejs/ui").ShallowRef<T, T>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<unknown, unknown>>;
  isSupported: boolean;
  write: () => void;
  read: () => void;
  remove: () => void;
  reset: () => void;
} & {
  stop(): void;
};
```

## Options

Options: storage, window, serializer { read(string): T, write(T): string }, flush (sync by default, pre, post or manual), writeDefaults (false), listenToStorageChanges (true), onError.

## Return values

Writable data; readonly error; isSupported; read(), write(), remove(), reset(), stop().

## Browser compatibility and limitations

Object persistence is replacement-based. For nested mutations call write() explicitly. JSON is the default serializer; use a validating custom serializer for untrusted or complex values. Undefined removes the key; null is JSON null. remove() restores the in-memory default without writing it. Defaults are never written on initialization unless requested. Cross-tab events do not notify other same-tab instances. Storage is not suitable for secrets.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
