# useDevicePixelRatio

Follow screen density and browser zoom changes.

[Open the interactive .vibe example](#/functions/useDevicePixelRatio)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useDevicePixelRatio } from '@usevibejs/use';

const { pixelRatio, stop } = useDevicePixelRatio();
```

## Signature

Generated from the built public declarations.

```ts
declare function useDevicePixelRatio(options?: {
  window?: Window;
}): {
  pixelRatio: Readonly<import("@usevibejs/ui").ShallowRef<number, number>>;
} & {
  stop(): void;
};
```

## Options

Optional window. Fallback ratio is one.

## Return values

Readonly pixelRatio; stop().

## Browser compatibility and limitations

Resolution media queries are rearmed for each density change; resize also refreshes the value. A missing matchMedia falls back to resize events.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
