# useResizeObserver

Observe an element without polling its layout.

[Open the interactive .vibe example](#/functions/useResizeObserver)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useResizeObserver } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const observer = useResizeObserver(element, entries => console.log(entries[0]?.contentRect.width));
```

## Signature

Generated from the built public declarations.

```ts
declare function useResizeObserver(target: ElementTarget, callback: ResizeObserverCallback, options?: ResizeObserverOptions): {
  isSupported: boolean;
  isActive: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  pause: () => void;
  resume: () => void;
} & {
  stop(): void;
};
```

## Options

Reactive nullable element; optional native ResizeObserverOptions including box.

## Return values

isSupported; readonly isActive; pause(), resume(), stop().

## Browser compatibility and limitations

Callbacks follow the browser resize delivery cycle. Avoid changing the observed size unconditionally from a callback, which can create a native resize loop.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
