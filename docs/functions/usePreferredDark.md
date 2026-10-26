# usePreferredDark

Read the operating system dark color preference.

[Open the interactive .vibe example](#/functions/usePreferredDark)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { usePreferredDark } from '@usevibejs/use';

const { matches, stop } = usePreferredDark();
```

## Signature

Generated from the built public declarations.

```ts
declare function usePreferredDark(options?: {
  window?: Window;
  initialValue?: boolean;
}): {
  matches: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  isSupported: boolean;
} & {
  stop(): void;
};
```

## Options

Optional window and initialValue (false).

## Return values

Readonly matches; isSupported; stop().

## Browser compatibility and limitations

Reads preference only. It does not change any classes or persist a choice.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
