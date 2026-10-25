# useCycle

Cycle through a reactive list with wrapped indices.

[Open the interactive .vibe example](#/functions/useCycle)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useCycle } from '@usevibejs/use';

const { state, index, next, prev, reset } = useCycle(['small', 'large'] as const);
next();
```

## Signature

Generated from the built public declarations.

```ts
declare function useCycle<T>(values: MaybeRefOrGetter<readonly T[]>, initialIndex?: number): {
  state: import("@usevibejs/ui").ComputedRef<T | undefined>;
  index: import("@usevibejs/ui").ComputedRef<number>;
  next: (delta?: number) => void;
  prev: (delta?: number) => void;
  reset: () => void;
};
```

## Options

The list accepts a value, ref, computed or getter. Optional initialIndex defaults to zero.

## Return values

Readonly computed state (T | undefined) and index; next(delta = 1), prev(delta = 1), reset().

## Browser compatibility and limitations

An empty list yields undefined state and index -1. No resource cleanup is necessary.

## Cleanup

This utility allocates no external resources.
