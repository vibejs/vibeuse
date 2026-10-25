# useThrottleFn

Limit callback calls while retaining the latest arguments.

[Open the interactive .vibe example](#/functions/useThrottleFn)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useThrottleFn } from '@usevibejs/use';

const update = useThrottleFn((x: number) => x * 2, 100);
update.call(10);
update.call(20);
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

leading and trailing default to true; delay accepts a value, ref or getter.

## Return values

call(...args), flush(), cancel(), stop(); readonly isPending.

## Browser compatibility and limitations

No polling and no promise queue. Cancellation drops the pending trailing arguments.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
