# useSupported

Evaluate a safe reactive capability check.

[Open the interactive .vibe example](#/functions/useSupported)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useSupported } from '@usevibejs/use';

const { isSupported } = useSupported(() => typeof ResizeObserver !== 'undefined');
```

## Signature

Generated from the built public declarations.

```ts
declare function useSupported(check: () => boolean): {
  isSupported: import("@usevibejs/ui").ComputedRef<boolean>;
};
```

## Options

Pass a boolean-returning getter. Its reactive dependencies are read within a native computed.

## Return values

Readonly computed isSupported. Exceptions from the check produce false.

## Browser compatibility and limitations

No polling or watcher. Plain browser globals do not become reactive; use dedicated composables for capabilities that change over time.

## Cleanup

This utility allocates no external resources.
