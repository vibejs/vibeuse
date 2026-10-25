# useElementBounding

Measure an element border box relative to the viewport.

[Open the interactive .vibe example](#/functions/useElementBounding)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useElementBounding } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const bounds = useElementBounding(element);
bounds.update();
```

## Signature

Generated from the built public declarations.

```ts
declare function useElementBounding(target: ElementTarget, options?: {
  window?: Window;
  windowScroll?: boolean;
  windowResize?: boolean;
}): {
  x: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  y: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  width: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  height: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  top: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  right: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  bottom: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  left: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  update: () => void;
} & {
  stop(): void;
};
```

## Options

windowScroll and windowResize default to true; optional window. ResizeObserver follows size changes.

## Return values

Readonly x, y, top, right, bottom, left, width, height; update(), stop().

## Browser compatibility and limitations

Detached targets reset to zero when measured. Pure position changes without resize/scroll need update(). Measurements use getBoundingClientRect and include CSS transforms.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
