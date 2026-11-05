import { expect, it, vi } from 'vitest';
import { useGeolocation } from './geolocation.ts';

function position(coords: Partial<GeolocationCoordinates>, timestamp = 5): GeolocationPosition {
  return {
    timestamp,
    coords: {
      latitude: 1,
      longitude: 2,
      accuracy: 3,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      ...coords,
    } as GeolocationCoordinates,
    toJSON() {
      return {};
    },
  };
}

function geolocationMock() {
  let next = 0;
  const watches = new Map<
    number,
    { success: PositionCallback; error: PositionErrorCallback; options?: PositionOptions }
  >();
  const geolocation = {
    watchPosition: vi.fn(
      (success: PositionCallback, error: PositionErrorCallback, options?: PositionOptions) => {
        const id = ++next;
        watches.set(id, { success, error, options });
        return id;
      },
    ),
    clearWatch: vi.fn((id: number) => {
      watches.delete(id);
    }),
  };
  return { geolocation, watches };
}

it('watches, pauses, resumes and ignores stale callbacks', () => {
  const { geolocation, watches } = geolocationMock();
  const nav = { geolocation } as unknown as Navigator;
  const location = useGeolocation({
    navigator: nav,
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 5,
  });
  expect(location.isSupported).toBe(true);
  expect(geolocation.watchPosition).toHaveBeenCalledOnce();
  expect(watches.get(1)?.options).toMatchObject({
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 5,
  });
  watches.get(1)!.success(position({ altitude: 4, altitudeAccuracy: 6, heading: 7, speed: 8 }, 20));
  expect(location.coords.value).toEqual({
    latitude: 1,
    longitude: 2,
    accuracy: 3,
    altitude: 4,
    altitudeAccuracy: 6,
    heading: 7,
    speed: 8,
  });
  expect(location.timestamp.value).toBe(20);
  const failure = { code: 1, message: 'denied' } as GeolocationPositionError;
  watches.get(1)!.error(failure);
  expect(location.error.value).toBe(failure);
  expect(location.coords.value?.latitude).toBe(1);
  const first = watches.get(1)!;
  location.pause();
  expect(geolocation.clearWatch).toHaveBeenCalledWith(1);
  first.success(position({ latitude: 9 }));
  first.error(failure);
  expect(location.coords.value?.latitude).toBe(1);
  location.resume();
  expect(geolocation.watchPosition).toHaveBeenCalledTimes(2);
  watches.get(2)!.success(position({ latitude: 9 }, 30));
  expect(location.coords.value?.latitude).toBe(9);
  expect(location.error.value).toBeNull();
  const stale = watches.get(2)!;
  location.stop();
  stale.success(position({ latitude: 4 }));
  stale.error(failure);
  expect(location.coords.value?.latitude).toBe(9);
  location.resume();
  expect(geolocation.watchPosition).toHaveBeenCalledTimes(2);
});

it('stays idle without the API until resume, including a missing navigator', () => {
  const { geolocation } = geolocationMock();
  const idle = useGeolocation({
    navigator: { geolocation } as unknown as Navigator,
    immediate: false,
  });
  expect(geolocation.watchPosition).not.toHaveBeenCalled();
  idle.pause();
  idle.resume();
  expect(geolocation.watchPosition).toHaveBeenCalledOnce();
  idle.stop();
  const missing = useGeolocation({ navigator: {} as Navigator });
  expect(missing.isSupported).toBe(false);
  missing.resume();
  missing.pause();
  missing.stop();
});
