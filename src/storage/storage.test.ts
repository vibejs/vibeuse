import { expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from '@usevibejs/ui';
import { useLocalStorage, useSessionStorage, useStorage } from './index.ts';

it('loads stored JSON without initialization writes, persists replacement and avoids identical writes', () => {
  localStorage.setItem('prefs', '{"n":2}');
  const set = vi.spyOn(Storage.prototype, 'setItem');
  const s = useStorage('prefs', { n: 1 });
  expect(s.data.value).toEqual({ n: 2 });
  expect(set).not.toHaveBeenCalled();
  s.data.value = { n: 3 };
  s.data.value = { n: 3 };
  expect(set).toHaveBeenCalledTimes(1);
  s.reset();
  expect(s.data.value).toEqual({ n: 1 });
  s.remove();
  expect(localStorage.getItem('prefs')).toBeNull();
  expect(s.data.value).toEqual({ n: 1 });
  s.stop();
  s.data.value = { n: 7 };
  s.write();
  s.read();
  s.reset();
  s.remove();
  expect(localStorage.getItem('prefs')).toBeNull();
});
it('handles null, undefined, primitives, defaults, manual writes and typed serializers', () => {
  const nil = useLocalStorage<null | number>('nil', null, { writeDefaults: true });
  expect(localStorage.getItem('nil')).toBe('null');
  nil.data.value = 1;
  nil.stop();
  const undef = useStorage<number | undefined>('undef', undefined);
  undef.data.value = 2;
  undef.data.value = undefined;
  expect(localStorage.getItem('undef')).toBeNull();
  undef.stop();
  const primitive = useSessionStorage('flag', false);
  primitive.data.value = true;
  expect(sessionStorage.getItem('flag')).toBe('true');
  expect(localStorage.getItem('flag')).toBeNull();
  primitive.stop();
  const date = useStorage('date', new Date(0), {
    flush: 'manual',
    serializer: { read: (raw) => new Date(raw), write: (value) => value.toISOString() },
  });
  date.data.value = new Date(1000);
  expect(localStorage.getItem('date')).toBeNull();
  date.write();
  expect(localStorage.getItem('date')).toBe(new Date(1000).toISOString());
  date.read();
  expect(date.data.value.getTime()).toBe(1000);
  date.stop();
});
it('does not clobber corrupted or unreadable values, reports serialization and quota failures', () => {
  localStorage.setItem('broken', '{');
  const onError = vi.fn();
  const broken = useStorage('broken', 10, { onError });
  expect(broken.data.value).toBe(10);
  expect(broken.error.value).toBeInstanceOf(Error);
  expect(localStorage.getItem('broken')).toBe('{');
  broken.stop();
  const quota = useStorage('quota', 1);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new DOMException('quota');
  });
  quota.data.value = 2;
  expect(quota.error.value).toBeInstanceOf(DOMException);
  quota.stop();
  const bad = useStorage('bad', Symbol('bad'));
  bad.write();
  expect(bad.error.value).toBeInstanceOf(TypeError);
  bad.stop();
  const inaccessible: Storage = {
    getItem: () => {
      throw new Error('read');
    },
    setItem: () => {},
    removeItem: () => {
      throw new Error('remove');
    },
    key: () => null,
    length: 0,
    clear: () => {},
  };
  const s = useStorage('s', 0, { storage: inaccessible });
  expect(s.error.value).toBeInstanceOf(Error);
  s.remove();
  expect(s.error.value).toBeInstanceOf(Error);
  s.stop();
  expect(onError).toHaveBeenCalled();
});
it('synchronizes cross-tab events, changes keys, and prevents queued write echoes', async () => {
  const key = ref('a');
  const s = useStorage(key, 0, { flush: 'post' });
  const set = vi.spyOn(Storage.prototype, 'setItem');
  const event = (key: string | null, newValue: string | null, storageArea = localStorage) =>
    window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea }));
  event('a', '3');
  expect(s.data.value).toBe(3);
  await nextTick();
  expect(set).not.toHaveBeenCalled();
  event('other', '4');
  event('a', '4', sessionStorage);
  expect(s.data.value).toBe(3);
  event(null, null);
  expect(s.data.value).toBe(0);
  event('a', 'bad');
  expect(s.error.value).toBeInstanceOf(Error);
  localStorage.setItem('b', '7');
  key.value = 'b';
  expect(s.data.value).toBe(7);
  const calls = set.mock.calls.length;
  await nextTick();
  expect(set).toHaveBeenCalledTimes(calls);
  s.data.value = 8;
  await nextTick();
  expect(localStorage.getItem('b')).toBe('8');
  s.stop();
  event('b', '9');
  expect(s.data.value).toBe(8);
});
it('isolates applications and releases scoped subscriptions', () => {
  const a = effectScope();
  const b = effectScope();
  const one = a.run(() => useStorage('one', 'a'))!;
  const two = b.run(() => useStorage('two', 'b', { listenToStorageChanges: false }))!;
  one.data.value = 'aa';
  expect(two.data.value).toBe('b');
  a.stop();
  b.stop();
  one.data.value = 'after';
  expect(localStorage.getItem('one')).toBe('"aa"');
});
it('handles unavailable storage access and session storage denial', () => {
  const denied = {
    get localStorage(): Storage {
      throw new Error('denied');
    },
  } as Window;
  const s = useStorage('denied', 1, { window: denied });
  expect(s.isSupported).toBe(false);
  expect(s.error.value).toBeInstanceOf(Error);
  s.stop();
  const session = useSessionStorage('denied', 1, {
    window: {
      get sessionStorage(): Storage {
        throw new Error('denied');
      },
    } as Window,
  });
  expect(session.error.value).toBeInstanceOf(Error);
  session.stop();
});
