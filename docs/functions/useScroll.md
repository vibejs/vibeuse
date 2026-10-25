# useScroll

Track two scroll axes, boundaries and programmatic scrolls.

[Open the interactive .vibe example](#/functions/useScroll)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useScroll } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const scroll = useScroll(element);
scroll.scrollTo({ y: 100, behavior: 'smooth' });
```

## Signature

Generated from the built public declarations.

```ts
declare function useScroll(target: EventTargetInput<Element | Window>, options?: ScrollOptions): {
  x: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  y: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  maxX: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  maxY: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  arrivedState: import("@usevibejs/ui").ComputedRef<{
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  }>;
  measure: () => void;
  scrollTo: (position: {
    x?: number;
    y?: number;
    behavior?: ScrollBehavior;
  }) => void;
} & {
  stop(): void;
};
```

## Options

Reactive Element or Window. offset defaults to one CSS pixel for boundaries. behavior accepts a reactive ScrollBehavior; optional window.

## Return values

Readonly x, y, maxX, maxY and computed arrivedState; scrollTo({ x?, y?, behavior? }), measure(), stop().

## Browser compatibility and limitations

Uses native scrollTo; smooth scroll position follows actual scroll events. Content-only extent changes require measure(). Boundaries currently assume normal left-to-right, non-reversed scroll coordinates.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
