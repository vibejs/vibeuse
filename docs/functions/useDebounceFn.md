# useDebounceFn

Debounce a typed callback with explicit scheduling controls.

[Open the interactive .vibe example](#/functions/useDebounceFn)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useDebounceFn } from '@usevibejs/use';

const search = useDebounceFn((query: string) => query.length, 250, { maxWait: 1000 });
search.call('vibe');
search.flush();
```

## Signature

Generated from the built public declarations.

```ts
declare function useDebounceFn<A extends unknown[], R>(fn: (...args: A) => R, ms?: MaybeRefOrGetter<number>, options?: DebounceOptions): {
  call: (...next: A) => void;
  cancel: () => void;
  flush: () => R | undefined;
  isPending: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

leading, trailing and maxWait control a burst. Delay accepts a ref or getter and is read when scheduling.

## Return values

call(...args) schedules and returns void. flush() returns the latest callback result or undefined. cancel(), stop(), readonly isPending.

## Browser compatibility and limitations

Callbacks receive their arguments, without an implicit this binding. Async callback failures belong to the caller; handle them inside the callback.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
