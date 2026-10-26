# useClickOutside

Respond to an outside click with pointer-origin and focus awareness.

[Open the interactive .vibe example](#/functions/useClickOutside)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useClickOutside } from '@usevibejs/use';

const element = shallowRef<HTMLElement | null>(null);
const outside = useClickOutside(element, () => console.log('outside'), { detectFocus: true });
```

## Signature

Generated from the built public declarations.

```ts
declare function useClickOutside(target: ElementTarget, handler: (event: MouseEvent | FocusEvent) => void, options?: ClickOutsideOptions): {
  stop(): void;
};
```

## Options

ignore accepts nullable reactive exclusion elements. detectFocus defaults to false; optional document.

## Return values

stop() removes pointerdown, click and optional focusin listeners.

## Browser compatibility and limitations

A primary pointer click must start outside. Keyboard-generated clicks work without pointerdown. Shadow paths and exclusions are honored. Iframe focus detection is outside this API.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
