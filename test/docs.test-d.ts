// Generated from documentation examples by scripts/generate-docs.ts.
import { ref, shallowRef, computed } from '@usevibejs/ui';
import {
  useDebounce,
  useDebounceFn,
  useThrottle,
  useThrottleFn,
  usePrevious,
  useCounter,
  useToggle,
  useCycle,
  useEventBus,
  useRefHistory,
  useEventListener,
  useWindowSize,
  useMediaQuery,
  usePreferredDark,
  useDark,
  useDocumentVisibility,
  useOnline,
  useClipboard,
  useTitle,
  useFavicon,
  useStorage,
  useLocalStorage,
  useSessionStorage,
  useElementSize,
  useElementBounding,
  useIntersectionObserver,
  useResizeObserver,
  useMutationObserver,
  useScroll,
  useFocus,
  useClickOutside,
  useMouse,
  useMouseInElement,
  useKeyModifier,
  useKeyPressed,
  useDevicePixelRatio,
  useIntervalFn,
  useTimeoutFn,
  useRafFn,
  useIdleCallback,
  usePermission,
  useSupported,
} from '../src/index.ts';
function useDebounceExample() {
  const input = ref('');
  const { value, cancel, flush, stop } = useDebounce(input, 250);
  return { input, value, cancel, flush, stop };
}
void useDebounceExample;
function useDebounceFnExample() {
  const search = useDebounceFn((query: string) => query.length, 250, { maxWait: 1000 });
  search.call('vibe');
  search.flush();
  return { search };
}
void useDebounceFnExample;
function useThrottleExample() {
  const input = ref('');
  const { value, stop } = useThrottle(() => input.value, 500);
  return { input, value, stop };
}
void useThrottleExample;
function useThrottleFnExample() {
  const update = useThrottleFn((x: number) => x * 2, 100);
  update.call(10);
  update.call(20);
  return { update };
}
void useThrottleFnExample;
function usePreviousExample() {
  const count = ref(0);
  const { previous, stop } = usePrevious(computed(() => count.value * 2));
  return { count, previous, stop };
}
void usePreviousExample;
function useCounterExample() {
  const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 });
  inc();
  dec(2);
  return { count, inc, dec, set, reset };
}
void useCounterExample;
function useToggleExample() {
  const { value, toggle, set } = useToggle(false);
  toggle();
  set(true);
  return { value, toggle, set };
}
void useToggleExample;
function useCycleExample() {
  const { state, index, next, prev, reset } = useCycle(['small', 'large'] as const);
  next();
  return { state, index, next, prev, reset };
}
void useCycleExample;
function useEventBusExample() {
  const bus = useEventBus<{ id: string }>();
  const off = bus.on((event) => console.log(event.id));
  bus.emit({ id: 'saved' });
  off();
  return { bus, off };
}
void useEventBusExample;
function useRefHistoryExample() {
  const count = ref(0);
  const history = useRefHistory(count, { clone: (n) => n, capacity: 50 });
  count.value++;
  history.undo();
  history.redo();
  return { count, history };
}
void useRefHistoryExample;
function useEventListenerExample() {
  const button = shallowRef<HTMLButtonElement | null>(null);
  const { stop } = useEventListener(button, 'click', (event) => console.log(event.clientX));
  return { button, stop };
}
void useEventListenerExample;
function useWindowSizeExample() {
  const { width, height, stop } = useWindowSize();
  return { width, height, stop };
}
void useWindowSizeExample;
function useMediaQueryExample() {
  const { matches, isSupported, stop } = useMediaQuery('(min-width: 900px)');
  return { matches, isSupported, stop };
}
void useMediaQueryExample;
function usePreferredDarkExample() {
  const { matches, stop } = usePreferredDark();
  return { matches, stop };
}
void usePreferredDarkExample;
function useDarkExample() {
  const target = shallowRef<Element | null>(null);
  const theme = useDark({ target, storageKey: 'app-theme' });
  theme.set('auto');
  theme.toggle();
  return { target, theme };
}
void useDarkExample;
function useDocumentVisibilityExample() {
  const { visibility, stop } = useDocumentVisibility();
  return { visibility, stop };
}
void useDocumentVisibilityExample;
function useOnlineExample() {
  const { isOnline, stop } = useOnline();
  return { isOnline, stop };
}
void useOnlineExample;
function useClipboardExample() {
  const clipboard = useClipboard();
  // Call from a user gesture in a browser component.
  const copy = () => clipboard.copy('Hello from VibeUse');
  return { clipboard, copy };
}
void useClipboardExample;
function useTitleExample() {
  const title = ref('My application');
  const { stop } = useTitle(title);
  return { title, stop };
}
void useTitleExample;
function useFaviconExample() {
  const icon = ref<string | null>('/icon.svg');
  const { stop } = useFavicon(icon);
  return { icon, stop };
}
void useFaviconExample;
function useStorageExample() {
  const preferences = useStorage('preferences', { compact: false });
  preferences.data.value = { compact: true };
  return { preferences };
}
void useStorageExample;
function useLocalStorageExample() {
  const preferences = useLocalStorage('preferences', { compact: false });
  preferences.data.value = { compact: true };
  return { preferences };
}
void useLocalStorageExample;
function useSessionStorageExample() {
  const preferences = useSessionStorage('preferences', { compact: false });
  preferences.data.value = { compact: true };
  return { preferences };
}
void useSessionStorageExample;
function useElementSizeExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const { width, height, stop } = useElementSize(element);
  return { element, width, height, stop };
}
void useElementSizeExample;
function useElementBoundingExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const bounds = useElementBounding(element);
  bounds.update();
  return { element, bounds };
}
void useElementBoundingExample;
function useIntersectionObserverExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const observer = useIntersectionObserver(
    element,
    (entries) => console.log(entries[0]?.isIntersecting),
    { threshold: 0.5 },
  );
  return { element, observer };
}
void useIntersectionObserverExample;
function useResizeObserverExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const observer = useResizeObserver(element, (entries) =>
    console.log(entries[0]?.contentRect.width),
  );
  return { element, observer };
}
void useResizeObserverExample;
function useMutationObserverExample() {
  const element = shallowRef<Node | null>(null);
  const observer = useMutationObserver(element, (records) => console.log(records.length), {
    childList: true,
  });
  return { element, observer };
}
void useMutationObserverExample;
function useScrollExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const scroll = useScroll(element);
  scroll.scrollTo({ y: 100, behavior: 'smooth' });
  return { element, scroll };
}
void useScrollExample;
function useFocusExample() {
  const element = shallowRef<HTMLInputElement | null>(null);
  const focus = useFocus(element);
  focus.set(true);
  return { element, focus };
}
void useFocusExample;
function useClickOutsideExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const outside = useClickOutside(element, () => console.log('outside'), { detectFocus: true });
  return { element, outside };
}
void useClickOutsideExample;
function useMouseExample() {
  const { x, y, stop } = useMouse({ type: 'client' });
  return { x, y, stop };
}
void useMouseExample;
function useMouseInElementExample() {
  const element = shallowRef<HTMLElement | null>(null);
  const mouse = useMouseInElement(element);
  return { element, mouse };
}
void useMouseInElementExample;
function useKeyModifierExample() {
  const { active, stop } = useKeyModifier('Shift');
  return { active, stop };
}
void useKeyModifierExample;
function useKeyPressedExample() {
  const { pressed, stop } = useKeyPressed('KeyK');
  return { pressed, stop };
}
void useKeyPressedExample;
function useDevicePixelRatioExample() {
  const { pixelRatio, stop } = useDevicePixelRatio();
  return { pixelRatio, stop };
}
void useDevicePixelRatioExample;
function useIntervalFnExample() {
  const delay = ref(1000);
  const timer = useIntervalFn(() => console.log('tick'), delay, { immediate: false });
  timer.resume();
  return { delay, timer };
}
void useIntervalFnExample;
function useTimeoutFnExample() {
  const timeout = useTimeoutFn(() => console.log('done'), 1000, { immediate: false });
  timeout.start();
  return { timeout };
}
void useTimeoutFnExample;
function useRafFnExample() {
  const raf = useRafFn(({ timestamp, delta }) => console.log(timestamp, delta), {
    immediate: false,
  });
  raf.resume();
  return { raf };
}
void useRafFnExample;
function useIdleCallbackExample() {
  const idle = useIdleCallback((deadline) => console.log(deadline.timeRemaining()), {
    immediate: false,
    timeout: 1000,
  });
  idle.start();
  return { idle };
}
void useIdleCallbackExample;
function usePermissionExample() {
  const permission = usePermission({ name: 'geolocation' });
  return { permission };
}
void usePermissionExample;
function useSupportedExample() {
  const { isSupported } = useSupported(() => typeof ResizeObserver !== 'undefined');
  return { isSupported };
}
void useSupportedExample;
