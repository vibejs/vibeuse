# useIntervalFn

Run one interval with reactive delay and explicit controls.

[Open the interactive .vibe example](#/functions/useIntervalFn)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useIntervalFn } from '@usevibejs/use';

const delay = ref(1000);
const timer = useIntervalFn(() => console.log('tick'), delay, { immediate: false });
timer.resume();
```

## Signature

Generated from the built public declarations.

```ts
declare function useIntervalFn(callback: () => void, ms?: MaybeRefOrGetter<number>, options?: IntervalOptions): {
  isActive: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
} & {
  stop(): void;
};
```

## Options

immediate defaults to true (start timer). immediateCallback defaults to false. Delay changes restart an active interval.

## Return values

Readonly isActive; pause(), resume(), cancel(), stop().

## Browser compatibility and limitations

Nonpositive delays use one millisecond. Native timer clamping and background-tab throttling apply. Repeated resume() replaces the timer rather than adding another.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
