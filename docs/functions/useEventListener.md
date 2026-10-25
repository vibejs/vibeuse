# useEventListener

Bind typed native events and follow a reactive target.

[Open the interactive .vibe example](#/functions/useEventListener)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useEventListener } from '@usevibejs/use';

const button = shallowRef<HTMLButtonElement | null>(null);
const { stop } = useEventListener(button, 'click', event => console.log(event.clientX));
```

## Signature

Generated from the built public declarations.

```ts
declare function useEventListener<T extends EventTarget, K extends keyof EventMap<T> & string>(target: EventTargetInput<T>, event: K, listener: (event: EventMap<T>[K]) => void, options?: AddEventListenerOptions | boolean): {
  stop(): void;
};
```

## Options

Pass a target value, ref or getter, event name, callback and optional native listener options. The capture mode is copied at creation.

## Return values

stop() removes the current listener and stops tracking replacements.

## Browser compatibility and limitations

Null targets have no listener. once and AbortSignal follow native semantics; replacing the target creates a new native subscription.

## Cleanup

The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
