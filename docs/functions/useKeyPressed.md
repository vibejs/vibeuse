# useKeyPressed

Track a key or physical key code with focus-aware release.

[Open the interactive .vibe example](#/functions/useKeyPressed)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useKeyPressed } from '@usevibejs/use';

const { pressed, stop } = useKeyPressed('KeyK');
```

## Signature

Generated from the built public declarations.

```ts
declare function useKeyPressed(key: string, options?: KeyOptions): {
  pressed: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

Match KeyboardEvent.key or code. Optional target, window and includeInputs (false).

## Return values

Readonly pressed; stop().

## Browser compatibility and limitations

Editable fields are ignored by default. A matching keydown records its physical code, so release still clears state if modifiers change the character. Global keyup, Meta release, blur and hidden documents clear pressed state. It observes keys without suppressing native shortcuts.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
