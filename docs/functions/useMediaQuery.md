# useMediaQuery

React to a native media query and query replacement.

[Open the interactive .vibe example](#/functions/useMediaQuery)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useMediaQuery } from '@usevibejs/use';

const { matches, isSupported, stop } = useMediaQuery('(min-width: 900px)');
```

## Signature

Generated from the built public declarations.

```ts
declare function useMediaQuery(query: MaybeRefOrGetter<string>, options?: {
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

Query accepts a value, ref or getter. Optional window and initialValue (false).

## Return values

Readonly matches; boolean isSupported; stop().

## Browser compatibility and limitations

Requires the modern MediaQueryList change event. No legacy addListener fallback or polling.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
