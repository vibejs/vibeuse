# useMouse

Track mouse coordinates from a configurable event target.

[Open the interactive .vibe example](#/functions/useMouse)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useMouse } from '@usevibejs/use';

const { x, y, stop } = useMouse({ type: 'client' });
```

## Signature

Generated from the built public declarations.

```ts
declare function useMouse(options?: MouseOptions): {
  x: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  y: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
  hasPosition: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

type is client (default) or page. Optional reactive target, initialX and initialY (zero).

## Return values

Readonly x, y and hasPosition; stop().

## Browser compatibility and limitations

Client coordinates are viewport-relative; page coordinates include document scrolling. Both use CSS pixels. This API tracks mouse events, not touch or pen input.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
