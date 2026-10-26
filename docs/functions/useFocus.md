# useFocus

Track focus and control a nullable focusable element.

[Open the interactive .vibe example](#/functions/useFocus)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useFocus } from '@usevibejs/use';

const element = shallowRef<HTMLInputElement | null>(null);
const focus = useFocus(element);
focus.set(true);
```

## Signature

Generated from the built public declarations.

```ts
declare function useFocus(target: ElementTarget<HTMLElement>, options?: {
  initialValue?: boolean;
  preventScroll?: boolean;
}): {
  focused: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  set: (value: boolean) => void;
} & {
  stop(): void;
};
```

## Options

initialValue defaults to false; optional preventScroll is forwarded to focus().

## Return values

Readonly focused; set(boolean), stop().

## Browser compatibility and limitations

The browser decides whether an element can receive focus. The flag describes the element itself, not its descendants.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
