# useGeolocation

Watch the browser geolocation API when it exists.

[Open the interactive .vibe example](#/functions/useGeolocation)

## Usage

```ts
import { ref, shallowRef, computed } from '@usevibejs/ui';
import { useGeolocation } from '@usevibejs/use';

const location = useGeolocation({ immediate: false });
location.resume();
```

## Signature

Generated from the built public declarations.

```ts
declare function useGeolocation(options?: UseGeolocationOptions): {
  coords: Readonly<import("@usevibejs/ui").ShallowRef<GeolocationSnapshot | null, GeolocationSnapshot | null>>;
  timestamp: Readonly<import("@usevibejs/ui").ShallowRef<number | null, number | null>>;
  error: Readonly<import("@usevibejs/ui").ShallowRef<GeolocationPositionError | null, GeolocationPositionError | null>>;
  isSupported: boolean;
  pause: () => void;
  resume: () => void;
} & {
  stop(): void;
};
```

## Options

immediate defaults to true. Optional navigator, enableHighAccuracy, timeout and maximumAge.

## Return values

Readonly coords, timestamp and error; isSupported; pause(), resume(), stop().

## Browser compatibility and limitations

A missing Geolocation API stays inactive and never invents a position. The browser may prompt when a watch starts. Coordinates are a snapshot, not a live browser object.

## Cleanup

The calling vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.
