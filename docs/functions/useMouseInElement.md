# useMouseInElement

Derive element-relative mouse position from viewport coordinates.

[Open the interactive .vibe example](#/functions/useMouseInElement)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useMouseInElement } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const mouse = useMouseInElement(element);
```

## Signature

Generated from the built public declarations.

```ts
declare function useMouseInElement(target: ElementTarget, options?: Omit<MouseOptions, 'type'>): {
  stop(): void;
  x: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  y: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  hasPosition: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  elementX: import("@usevibejs/ui").ComputedRef<number>;
  elementY: import("@usevibejs/ui").ComputedRef<number>;
  isOutside: import("@usevibejs/ui").ComputedRef<boolean>;
} & {
  stop(): void;
};
```

## Options

Reactive element plus optional mouse target and initial coordinates. Uses client coordinates.

## Return values

Readonly x, y, elementX, elementY and isOutside; stop().

## Browser compatibility and limitations

Relative coordinates use the element border-box origin and can be negative outside. CSS transforms are represented by their bounding rectangle, not inverted into local transform space.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
