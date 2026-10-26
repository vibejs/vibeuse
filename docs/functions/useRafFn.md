# useRafFn

Schedule native animation frames with timestamps and deltas.

[Open the interactive .vibe example](#/functions/useRafFn)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useRafFn } from '@usevibejs/use';

const raf = useRafFn(({ timestamp, delta }) => console.log(timestamp, delta), { immediate: false });
raf.resume();
```

## Signature

Generated from the built public declarations.

```ts
declare function useRafFn(callback: (frame: RafFrame) => void, options?: {
  immediate?: boolean;
  window?: Window;
}): {
  isSupported: boolean;
  isActive: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
} & {
  stop(): void;
};
```

## Options

immediate defaults to true; optional window.

## Return values

isSupported; readonly isActive; pause(), resume(), cancel(), stop().

## Browser compatibility and limitations

The first delta after each resume is zero. The frame object is reused; copy it if retaining a frame. Missing RAF yields an inactive controller; no animation engine or timer fallback is added.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
