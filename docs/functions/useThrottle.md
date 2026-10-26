# useThrottle

Limit how frequently a reactive value propagates.

[Open the interactive .vibe example](#/functions/useThrottle)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useThrottle } from '@usevibejs/use';

const input = ref('');
const { value, stop } = useThrottle(() => input.value, 500);
```

## Signature

Generated from the built public declarations.

```ts
declare function useThrottleFn<A extends unknown[], R>(fn: (...args: A) => R, ms?: MaybeRefOrGetter<number>, options?: ThrottleOptions): {
  call: (...next: A) => void;
  cancel: () => void;
  flush: () => R | undefined;
  isPending: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

leading and trailing both default to true. Reactive delay is read at the start of each window.

## Return values

Readonly value, isPending; flush(), cancel(), stop().

## Browser compatibility and limitations

Automatic updates remain at least one delay apart, including after a trailing update. A trailing value is delivered only if another change arrived. flush() bypasses the cooldown explicitly.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
