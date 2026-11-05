# useBreakpoints

Track named min-width breakpoints from the viewport.

[Open the interactive .vibe example](#/functions/useBreakpoints)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useBreakpoints } from '@usevibejs/use';

const viewport = useBreakpoints({ sm: 640, md: 768, lg: 1024 });
const compact = viewport.smaller('md');
```

## Signature

Generated from the built public declarations.

```ts
declare function useBreakpoints(breakpoints: MaybeRefOrGetter<Readonly<Record<string, number>>>, options?: UseBreakpointsOptions): {
  active: Readonly<import("@usevibejs/ui").ShallowRef<readonly string[], readonly string[]>>;
  current: import("@usevibejs/ui").ComputedRef<string | undefined>;
  isSupported: boolean;
  matches: (name: string) => boolean;
  greater: (name: string) => boolean;
  smaller: (name: string) => boolean;
  between: (min: string, max: string) => boolean;
} & {
  stop(): void;
};
```

## Options

A reactive map of names to CSS-pixel minimums. Optional window. fallback is used only when matchMedia is missing.

## Return values

Readonly active and current; matches(name), greater(name), smaller(name), between(min, max); isSupported; stop().

## Browser compatibility and limitations

Minimum widths only. Non-finite values are ignored. There is no server snapshot; a missing matchMedia keeps the fallback names that still exist in the map.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
