# useIdleCallback

Schedule native idle work with explicit capability reporting.

[Open the interactive .vibe example](#/functions/useIdleCallback)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useIdleCallback } from '@usevibejs/use';

const idle = useIdleCallback(deadline => console.log(deadline.timeRemaining()), { immediate: false, timeout: 1000 });
idle.start();
```

## Signature

Generated from the built public declarations.

```ts
declare function useIdleCallback(callback: IdleRequestCallback, options?: {
  immediate?: boolean;
  timeout?: number;
  window?: Window;
}): {
  isSupported: boolean;
  isPending: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  start: () => void;
  cancel: () => void;
} & {
  stop(): void;
};
```

## Options

immediate defaults to true. Optional native timeout and window.

## Return values

isSupported; readonly isPending; start(), cancel(), stop().

## Browser compatibility and limitations

Some browsers do not expose requestIdleCallback. Unsupported calls remain inactive; no fabricated idle deadline or setTimeout fallback is used.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
