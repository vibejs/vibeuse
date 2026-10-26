# useEventBus

Create an isolated typed event bus for explicit sharing.

[Open the interactive .vibe example](#/functions/useEventBus)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useEventBus } from '@usevibejs/use';

const bus = useEventBus<{ id: string }>();
const off = bus.on(event => console.log(event.id));
bus.emit({ id: 'saved' });
off();
```

## Signature

Generated from the built public declarations.

```ts
declare function useEventBus<T>(): {
  on: (listener: (event: T) => void) => () => void;
  emit: (event: T) => void;
  clear: () => void;
} & {
  stop(): void;
};
```

## Options

Specify the event payload type. Share a returned bus explicitly or through vibe.js provide/inject.

## Return values

on(listener) returns off(); emit(event), clear(), stop().

## Browser compatibility and limitations

There is no global named registry. Listeners added during emission wait until the next emission. Each subscription is cleaned up with its subscribing scope.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
