# useOnline

Follow browser online and offline notifications.

[Open the interactive .vibe example](#/functions/useOnline)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useOnline } from '@usevibejs/use';

const { isOnline, stop } = useOnline();
```

## Signature

Generated from the built public declarations.

```ts
declare function useOnline(win?: Window | undefined): {
  isOnline: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
} & {
  stop(): void;
};
```

## Options

Optional Window argument. Fallback is true.

## Return values

Readonly isOnline; stop().

## Browser compatibility and limitations

navigator.onLine describes the browser connection flag. It does not prove that a server is reachable.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
