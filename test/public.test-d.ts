import { computed, ref, shallowRef } from '@usevibejs/ui';
import type { ComputedRef } from '@usevibejs/ui';
import {
  useClipboard,
  useCycle,
  useDebounce,
  useDebounceFn,
  useEventBus,
  useEventListener,
  useRefHistory,
  useStorage,
  useThrottle,
  useToggle,
} from '../src/index.ts';
import type { StorageSerializer } from '../src/index.ts';
import { expectTypeOf } from 'vitest';

const literal = shallowRef<'open' | 'closed'>('open');
expectTypeOf(useDebounce(literal).value.value).toEqualTypeOf<'open' | 'closed'>();
expectTypeOf(useThrottle(computed(() => literal.value)).value.value).toEqualTypeOf<
  'open' | 'closed'
>();
expectTypeOf(useDebounce((): number | null => null).value.value).toEqualTypeOf<number | null>();
expectTypeOf(useCycle(['a', 'b'] as const).state).toEqualTypeOf<
  ComputedRef<'a' | 'b' | undefined>
>();
const history = useRefHistory(ref(1), { clone: (n) => n });
expectTypeOf(history.history.value).toEqualTypeOf<readonly number[]>();
useRefHistory(computed({ get: () => 1, set: (_n: number) => {} }), { clone: (n) => n });
const readonlyComputed = computed(() => 1);
// @ts-expect-error Readonly computed cannot be used as writable history source.
useRefHistory(readonlyComputed, { clone: (n: number) => n });
// @ts-expect-error A clone strategy is mandatory.
useRefHistory(ref({ nested: 1 }));
// @ts-expect-error Derived state is readonly.
useToggle().value.value = true;
const filter = useDebounceFn((n: number, label: string) => `${n}${label}`);
filter.call(1, 'a');
// @ts-expect-error Callback arguments are preserved.
filter.call('bad', 1);
const bus = useEventBus<{ id: string }>();
bus.emit({ id: 'one' });
// @ts-expect-error Events remain typed.
bus.emit({ id: 1 });
useEventListener(document.createElement('button'), 'click', (event) => {
  expectTypeOf(event).toEqualTypeOf<PointerEvent>();
});
useEventListener(window, 'keydown', (event) => {
  expectTypeOf(event).toEqualTypeOf<KeyboardEvent>();
});
const serializer: StorageSerializer<Date> = {
  read: (raw) => new Date(raw),
  write: (date) => date.toISOString(),
};
expectTypeOf(useStorage('date', new Date(), { serializer }).data.value).toEqualTypeOf<Date>();
// @ts-expect-error Serializer values must match the storage value type.
useStorage('number', 1, { serializer });
expectTypeOf(useClipboard().copy('one')).toEqualTypeOf<Promise<boolean>>();
const readonlyRef: Readonly<ReturnType<typeof shallowRef<number>>> = shallowRef(1);
// @ts-expect-error A readonly ref is not a writable history source.
useRefHistory(readonlyRef, { clone: (n: number) => n });
