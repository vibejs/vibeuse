# useWindowSize

Observe the layout viewport in CSS pixels.

[Open the interactive .vibe example](#/functions/useWindowSize)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useWindowSize } from '@usevibejs/use';

const { width, height, stop } = useWindowSize();
```

## Signature

Generated from the built public declarations.

```ts
declare function useWindowSize(options?: {
  window?: Window;
  initialWidth?: number;
  initialHeight?: number;
}): {
  width: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  height: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
} & {
  stop(): void;
};
```

## Options

Optional window, initialWidth and initialHeight. Fallback dimensions default to zero.

## Return values

Readonly width, height; stop().

## Browser compatibility and limitations

Uses innerWidth/innerHeight and resize events, not the visual viewport or physical screen dimensions.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
