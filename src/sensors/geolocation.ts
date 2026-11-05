import { shallowRef } from '@usevibejs/ui';
import { defaultNavigator, resource } from '../shared/resource.ts';

export interface GeolocationSnapshot {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly speed: number | null;
}

export interface UseGeolocationOptions {
  navigator?: Navigator;
  /** Start `watchPosition` immediately. Defaults to true. */
  immediate?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

function snapshot(coords: GeolocationCoordinates): GeolocationSnapshot {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
  };
}

/** Watches the browser geolocation API. A missing API stays inactive and does not claim a position. */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  return resource((cleanup, alive) => {
    const nav = options.navigator ?? defaultNavigator();
    const isSupported = !!nav?.geolocation;
    const coords = shallowRef<GeolocationSnapshot | null>(null);
    const timestamp = shallowRef<number | null>(null);
    const error = shallowRef<GeolocationPositionError | null>(null);
    let generation = 0;
    let watchId: number | undefined;
    const stopWatch = () => {
      generation += 1;
      if (watchId !== undefined) {
        nav!.geolocation.clearWatch(watchId);
        watchId = undefined;
      }
    };
    const resume = () => {
      if (!alive() || !isSupported) return;
      stopWatch();
      const id = generation;
      watchId = nav!.geolocation.watchPosition(
        (position) => {
          if (!alive() || id !== generation) return;
          coords.value = snapshot(position.coords);
          timestamp.value = position.timestamp;
          error.value = null;
        },
        (failure) => {
          if (!alive() || id !== generation) return;
          error.value = failure;
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
        },
      );
    };
    if (options.immediate !== false) resume();
    cleanup(stopWatch);
    return {
      coords: coords as Readonly<typeof coords>,
      timestamp: timestamp as Readonly<typeof timestamp>,
      error: error as Readonly<typeof error>,
      isSupported,
      pause: stopWatch,
      resume,
    };
  });
}
