# useElementSize

Observe an element content box with ResizeObserver.

[Open the interactive .vibe example](#/functions/useElementSize)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useElementSize } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const { width, height, stop } = useElementSize(element);
```

## Signature

Generated from the built public declarations.

```ts
declare function useElementSize(target: ElementTarget, initial?: {
  width: number;
  height: number;
}): {
  width: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  height: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
} & {
  stop(): void;
};
```

## Options

Reactive nullable element. Optional initial { width, height }, both zero by default.

## Return values

Readonly width and height in CSS pixels; stop().

## Browser compatibility and limitations

ResizeObserver delivers content-box measurements. Hidden elements report zero; a missing target resets to zero. Without ResizeObserver only the initial measurement is available.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
