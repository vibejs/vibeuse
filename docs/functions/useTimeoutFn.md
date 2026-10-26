# useTimeoutFn

Schedule a cancelable one-shot callback.

[Open the interactive .vibe example](#/functions/useTimeoutFn)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useTimeoutFn } from '@usevibejs/use';

const timeout = useTimeoutFn(() => console.log('done'), 1000, { immediate: false });
timeout.start();
```

## Signature

Generated from the built public declarations.

```ts
declare function useTimeoutFn(callback: () => void, ms?: MaybeRefOrGetter<number>, options?: {
  immediate?: boolean;
}): {
  isPending: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  start: () => void;
  cancel: () => void;
} & {
  stop(): void;
};
```

## Options

immediate defaults to true. A reactive delay is read each time start() is called.

## Return values

Readonly isPending; start(), cancel(), stop().

## Browser compatibility and limitations

Calling start() replaces a pending timeout. Changing the delay alone does not reschedule an existing timeout.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
