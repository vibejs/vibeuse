# useToggle

Control boolean state through small explicit actions.

[Open the interactive .vibe example](#/functions/useToggle)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useToggle } from '@usevibejs/use';

const { value, toggle, set } = useToggle(false);
toggle();
set(true);
```

## Signature

Generated from the built public declarations.

```ts
declare function useToggle(initial?: boolean): {
  value: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  set: (next: boolean) => void;
  toggle: () => boolean;
};
```

## Options

initial defaults to false.

## Return values

Readonly value; toggle() returns the new boolean; set(boolean).

## Browser compatibility and limitations

Creates local state and does not mutate an input ref. No resource cleanup is necessary.

## Cleanup

This utility allocates no external resources.
