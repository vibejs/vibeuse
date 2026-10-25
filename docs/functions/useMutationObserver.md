# useMutationObserver

Observe DOM changes and follow a replaceable node.

[Open the interactive .vibe example](#/functions/useMutationObserver)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useMutationObserver } from '@usevibejs/use';

const element = shallowRef<Node | null>(null);
const observer = useMutationObserver(element, records => console.log(records.length), { childList: true });
```

## Signature

Generated from the built public declarations.

```ts
declare function useMutationObserver(target: MaybeRefOrGetter<Node | null | undefined>, callback: MutationCallback, options?: MutationObserverInit): {
  isSupported: boolean;
  isActive: Readonly<import("@usevibejs/ui").ShallowRef<boolean, boolean>>;
  pause: () => void;
  resume: () => void;
} & {
  stop(): void;
};
```

## Options

Nullable reactive Node; MutationObserverInit defaults to childList and subtree. Explicit options replace that default.

## Return values

isSupported; readonly isActive; pause(), resume(), stop().

## Browser compatibility and limitations

Invalid native observer configuration throws through the framework watcher error handling. Mutation records describe DOM changes, not computed styles.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
