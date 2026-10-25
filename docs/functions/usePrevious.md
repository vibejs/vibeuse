# usePrevious

Remember the previous observed reactive value.

[Open the interactive .vibe example](#/functions/usePrevious)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { usePrevious } from '@usevibejs/use';

const count = ref(0);
const { previous, stop } = usePrevious(computed(() => count.value * 2));
```

## Signature

Generated from the built public declarations.

```ts
declare function usePrevious<T>(source: MaybeRefOrGetter<T>, initial?: T): {
  previous: Readonly<import("@usevibejs/ui").Ref<any, any> extends T | undefined ? import("@usevibejs/ui").ShallowRef<undefined, undefined> | (T extends T & import("@usevibejs/ui").Ref<any, any> ? 0 extends 1 & T ? import("@usevibejs/ui").ShallowRef<T, T> : T : import("@usevibejs/ui").ShallowRef<T, T>) : import("@usevibejs/ui").ShallowRef<T | undefined, T | undefined>>;
} & {
  stop(): void;
};
```

## Options

Optional second argument sets the initial previous value.

## Return values

Readonly previous ref, initially undefined unless configured; stop().

## Browser compatibility and limitations

Snapshots are references. Use immutable values or useRefHistory with an explicit clone strategy.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
