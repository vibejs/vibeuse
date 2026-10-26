# useDebounce

Delay a reactive value until changes settle.

[Open the interactive .vibe example](#/functions/useDebounce)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useDebounce } from '@usevibejs/use';

const input = ref('');
const { value, cancel, flush, stop } = useDebounce(input, 250);
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

Reactive delay in milliseconds. leading defaults to false; trailing defaults to true. maxWait bounds a burst.

## Return values

Readonly value and isPending refs; cancel(), flush(), stop().

## Browser compatibility and limitations

Tracks value replacement; it does not implicitly traverse objects.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
