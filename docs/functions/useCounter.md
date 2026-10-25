# useCounter

Control a numeric counter with optional bounds.

[Open the interactive .vibe example](#/functions/useCounter)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useCounter } from '@usevibejs/use';

const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 });
inc();
dec(2);
```

## Signature

Generated from the built public declarations.

```ts
declare function useCounter(initial?: number, { min, max }?: CounterOptions): {
  count: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  set: (value: number) => void;
  inc: (delta?: number) => void;
  dec: (delta?: number) => void;
  reset: () => void;
};
```

## Options

initial defaults to zero. min and max default to unbounded. Inverted bounds throw RangeError.

## Return values

Readonly count; inc(delta = 1), dec(delta = 1), set(number), reset().

## Browser compatibility and limitations

No external resources; no stop() is needed. Bounds are configuration values, not reactive inputs.

## Cleanup

This utility allocates no external resources.
