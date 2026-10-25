# useClipboard

Write text with honest asynchronous success and error state.

[Open the interactive .vibe example](#/functions/useClipboard)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useClipboard } from '@usevibejs/use';

const clipboard = useClipboard();
// Call from a user gesture in a browser component.
const copy = () => clipboard.copy('Hello from VibeUse');
```

## Signature

Generated from the built public declarations.

```ts
declare function useClipboard(options?: {
  navigator?: Navigator;
}): {
  copy: (value: string) => Promise<boolean>;
  isSupported: boolean;
  text: Readonly<import("@usevibejs/ui").ShallowRef<string, string>>;
  copied: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<unknown, unknown>>;
  isPending: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

Optional navigator. No reads or permission requests happen automatically.

## Return values

copy(text): Promise<boolean>; isSupported; readonly text, copied, error and isPending; stop().

## Browser compatibility and limitations

Secure contexts and browser permission rules apply. The latest request controls state; stale results are ignored. copied becomes true only after a successful native write.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
