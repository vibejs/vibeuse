# useIntersectionObserver

Observe visibility intersections using the native observer.

[Open the interactive .vibe example](#/functions/useIntersectionObserver)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useIntersectionObserver } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const observer = useIntersectionObserver(element, entries => console.log(entries[0]?.isIntersecting), { threshold: 0.5 });
```

## Signature

Generated from the built public declarations.

```ts
declare function useIntersectionObserver(target: ElementTarget, callback: IntersectionObserverCallback, options?: IntersectionObserverInit): {
  isSupported: boolean;
  isActive: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  pause: () => void;
  resume: () => void;
} & {
  stop(): void;
};
```

## Options

Reactive nullable element; native IntersectionObserverInit including root, rootMargin and threshold.

## Return values

isSupported; readonly isActive; pause(), resume(), stop().

## Browser compatibility and limitations

The browser delivers asynchronous intersection records. A stale target cannot update through the callback. Configuration is fixed for the lifetime of this call.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
