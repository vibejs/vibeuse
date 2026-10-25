# useKeyModifier

Track a keyboard modifier without leaving it stuck on blur.

[Open the interactive .vibe example](#/functions/useKeyModifier)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useKeyModifier } from '@usevibejs/use';

const { active, stop } = useKeyModifier('Shift');
```

## Signature

Generated from the built public declarations.

```ts
declare function useKeyModifier(modifier: KeyModifier, options?: KeyOptions): {
  active: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

Alt, Control, Meta or Shift; optional target and window. includeInputs defaults to true.

## Return values

Readonly active; stop().

## Browser compatibility and limitations

keyup is observed on the window even when keydown has a narrower target. Blur, hidden documents and target replacement reset the state.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
