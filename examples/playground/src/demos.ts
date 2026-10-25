import { computed, ref } from '@usevibejs/ui';
import type { ComputedRef, Ref } from '@usevibejs/ui';
import * as use from '@usevibejs/use';

export interface Demo {
  read: () => unknown;
  actions: Array<{ label: string; run: () => unknown }>;
  input?: Ref<string>;
  surface?: 'size' | 'scroll' | 'intersection' | 'mouse' | 'outside' | 'mutation' | 'focus';
  hint: string;
  open?: Readonly<Ref<boolean>>;
}
export function createDemo(
  name: string,
  target: Readonly<Ref<HTMLElement | null>>,
  field: Readonly<Ref<HTMLInputElement | null>>,
): Demo {
  const input = ref('VibeUse');
  const action = (label: string, run: () => unknown) => ({ label, run });
  const state = (
    read: () => unknown,
    actions: Demo['actions'] = [],
    hint = 'Change a value and watch the native reactive state update.',
  ): Demo => ({ read, actions, hint });
  switch (name) {
    case 'useDebounce': {
      const d = use.useDebounce(input, 400);
      return {
        ...state(
          () => ({ input: input.value, debounced: d.value.value, pending: d.isPending.value }),
          [action('Flush', d.flush), action('Cancel', d.cancel)],
        ),
        input,
      };
    }
    case 'useThrottle': {
      const d = use.useThrottle(input, 700);
      return {
        ...state(
          () => ({ input: input.value, throttled: d.value.value, pending: d.isPending.value }),
          [action('Flush', d.flush), action('Cancel', d.cancel)],
        ),
        input,
      };
    }
    case 'useDebounceFn':
    case 'useThrottleFn': {
      const calls = ref(0);
      const last = ref('');
      const fn = name === 'useDebounceFn' ? use.useDebounceFn : use.useThrottleFn;
      const d = fn(() => {
        calls.value++;
        last.value = input.value;
      }, 700);
      return {
        ...state(
          () => ({ calls: calls.value, last: last.value, pending: d.isPending.value }),
          [action('Schedule call', d.call), action('Flush', d.flush), action('Cancel', d.cancel)],
        ),
        input,
      };
    }
    case 'usePrevious': {
      const d = use.usePrevious(input);
      return { ...state(() => ({ current: input.value, previous: d.previous.value })), input };
    }
    case 'useCounter': {
      const d = use.useCounter(0, { min: 0, max: 10 });
      return state(
        () => ({ count: d.count.value, min: 0, max: 10 }),
        [
          action('Increment', () => d.inc()),
          action('Decrement', () => d.dec()),
          action('Reset', d.reset),
        ],
      );
    }
    case 'useToggle': {
      const d = use.useToggle();
      return state(() => ({ enabled: d.value.value }), [action('Toggle', d.toggle)]);
    }
    case 'useCycle': {
      const d = use.useCycle(['Draft', 'Review', 'Published']);
      return state(
        () => ({ state: d.state.value, index: d.index.value }),
        [
          action('Previous', () => d.prev()),
          action('Next', () => d.next()),
          action('Reset', d.reset),
        ],
      );
    }
    case 'useEventBus': {
      const bus = use.useEventBus<string>();
      const events = ref<string[]>([]);
      bus.on((event) => {
        events.value = [...events.value.slice(-4), event];
      });
      return {
        ...state(
          () => ({ events: events.value }),
          [
            action('Emit message', () => bus.emit(input.value)),
            action('Clear messages', () => {
              events.value = [];
            }),
          ],
          'This demo owns an isolated typed bus.',
        ),
        input,
      };
    }
    case 'useRefHistory': {
      const count = ref(0);
      const d = use.useRefHistory(count, { clone: (n) => n, capacity: 5 });
      return state(
        () => ({
          count: count.value,
          history: d.history.value,
          canUndo: d.canUndo.value,
          canRedo: d.canRedo.value,
        }),
        [
          action('Increment', () => count.value++),
          action('Undo', d.undo),
          action('Redo', d.redo),
          action('Clear history', d.clear),
        ],
      );
    }
    case 'useEventListener': {
      const clicks = ref(0);
      use.useEventListener(target, 'click', () => clicks.value++);
      return { ...state(() => ({ surfaceClicks: clicks.value })), surface: 'mutation' };
    }
    case 'useWindowSize': {
      const d = use.useWindowSize();
      return state(
        () => ({ width: d.width.value, height: d.height.value }),
        [],
        'Resize the browser window. Measurements are CSS pixels.',
      );
    }
    case 'useMediaQuery': {
      const d = use.useMediaQuery('(min-width: 900px)');
      return state(
        () => ({ query: '(min-width: 900px)', matches: d.matches.value }),
        [],
        'Resize across 900px to inspect this breakpoint.',
      );
    }
    case 'usePreferredDark': {
      const d = use.usePreferredDark();
      return state(
        () => ({ prefersDark: d.matches.value }),
        [],
        'Change your operating system color preference.',
      );
    }
    case 'useDark': {
      const d = use.useDark({ target, storageKey: 'vibeuse-demo-theme' });
      return {
        ...state(
          () => ({ preference: d.preference.value, dark: d.isDark.value }),
          [action('Toggle theme', d.toggle), action('Use system', () => d.set('auto'))],
          'This demo changes only the preview surface. Your choice is saved locally.',
        ),
        surface: 'size',
      };
    }
    case 'useDocumentVisibility': {
      const d = use.useDocumentVisibility();
      return state(
        () => ({ visibility: d.visibility.value }),
        [],
        'Switch tabs, then return to inspect the current visibility.',
      );
    }
    case 'useOnline': {
      const d = use.useOnline();
      return state(
        () => ({ online: d.isOnline.value }),
        [],
        'This reflects the browser connection flag, not reachability of your server.',
      );
    }
    case 'useClipboard': {
      const d = use.useClipboard();
      return {
        ...state(
          () => ({
            supported: d.isSupported,
            copied: d.copied.value,
            text: d.text.value,
            pending: d.isPending.value,
            error: d.error.value ? String(d.error.value) : null,
          }),
          [action('Copy text', () => d.copy(input.value))],
          'Copy runs from your click. The browser may restrict clipboard access.',
        ),
        input,
      };
    }
    case 'useTitle': {
      use.useTitle(input);
      return {
        ...state(
          () => ({ documentTitle: input.value }),
          [],
          'Edit the browser tab title. Leaving this example restores its previous title.',
        ),
        input,
      };
    }
    case 'useFavicon': {
      const href = ref(
        'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="25" font-size="26">✦</text></svg>',
          ),
      );
      use.useFavicon(href);
      return state(
        () => ({ favicon: 'Live SVG icon in the browser tab' }),
        [
          action('Change icon', () => {
            href.value =
              'data:image/svg+xml,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="25" font-size="26">⚡</text></svg>',
              );
          }),
        ],
      );
    }
    case 'useStorage':
    case 'useLocalStorage':
    case 'useSessionStorage': {
      const fn =
        name === 'useSessionStorage'
          ? use.useSessionStorage
          : name === 'useStorage'
            ? use.useStorage
            : use.useLocalStorage;
      const d = fn(`vibeuse-demo-${name}`, 'My preference');
      return {
        ...state(
          () => ({
            saved: d.data.value,
            supported: d.isSupported,
            error: d.error.value ? String(d.error.value) : null,
          }),
          [action('Reset', d.reset), action('Remove saved value', d.remove)],
          'Edits persist automatically. Reload to verify. Only this demo preference is stored.',
        ),
        input: d.data,
      };
    }
    case 'useElementSize': {
      const d = use.useElementSize(target);
      return {
        ...state(
          () => ({ width: d.width.value, height: d.height.value }),
          [],
          'Drag the bottom-right corner of the preview.',
        ),
        surface: 'size',
      };
    }
    case 'useElementBounding': {
      const d = use.useElementBounding(target);
      return {
        ...state(
          () => ({ x: d.x.value, y: d.y.value, width: d.width.value, height: d.height.value }),
          [action('Measure', d.update)],
          'Resize the surface or scroll the page. Coordinates are viewport-relative.',
        ),
        surface: 'size',
      };
    }
    case 'useResizeObserver': {
      const events = ref(0);
      const d = use.useResizeObserver(target, () => events.value++);
      return {
        ...state(
          () => ({ resizeNotifications: events.value, supported: d.isSupported }),
          [action('Pause', d.pause), action('Resume', d.resume)],
        ),
        surface: 'size',
      };
    }
    case 'useIntersectionObserver': {
      const visible = ref(false);
      const ratio = ref(0);
      const d = use.useIntersectionObserver(
        target,
        (entries) => {
          visible.value = entries[0].isIntersecting;
          ratio.value = entries[0].intersectionRatio;
        },
        { threshold: [0, 0.5, 1] },
      );
      return {
        ...state(
          () => ({ visible: visible.value, ratio: ratio.value, supported: d.isSupported }),
          [],
          'Scroll the marked surface into and out of its container.',
        ),
        surface: 'intersection',
      };
    }
    case 'useMutationObserver': {
      const changes = ref(0);
      use.useMutationObserver(target, (records) => {
        changes.value += records.length;
      });
      return {
        ...state(
          () => ({ mutationRecords: changes.value }),
          [
            action('Append a node', () => {
              const span = document.createElement('span');
              span.textContent = ' +';
              target.value?.append(span);
            }),
          ],
        ),
        surface: 'mutation',
      };
    }
    case 'useScroll': {
      const d = use.useScroll(target);
      return {
        ...state(
          () => ({
            x: d.x.value,
            y: d.y.value,
            progress: d.maxY.value ? Math.round((d.y.value / d.maxY.value) * 100) + '%' : '0%',
            boundaries: d.arrivedState.value,
          }),
          [
            action('Scroll to top', () => d.scrollTo({ x: 0, y: 0 })),
            action('Scroll to end', () => d.scrollTo({ x: d.maxX.value, y: d.maxY.value })),
          ],
        ),
        surface: 'scroll',
      };
    }
    case 'useFocus': {
      const d = use.useFocus(field);
      return {
        ...state(
          () => ({ focused: d.focused.value }),
          [action('Focus field', () => d.set(true)), action('Blur field', () => d.set(false))],
        ),
        surface: 'focus',
      };
    }
    case 'useClickOutside': {
      const open = ref(false);
      use.useClickOutside(
        target,
        () => {
          open.value = false;
        },
        { detectFocus: true },
      );
      return {
        ...state(
          () => ({ dropdownOpen: open.value }),
          [
            action('Open dropdown', () => {
              open.value = true;
            }),
          ],
          'Open the dropdown, then click or focus outside the preview surface.',
        ),
        surface: 'outside',
        open,
        read: () => ({ dropdownOpen: open.value }),
      };
    }
    case 'useMouse': {
      const d = use.useMouse();
      return state(
        () => ({ clientX: d.x.value, clientY: d.y.value }),
        [],
        'Move your mouse. Coordinates are CSS pixels relative to the viewport.',
      );
    }
    case 'useMouseInElement': {
      const d = use.useMouseInElement(target);
      return {
        ...state(
          () => ({
            elementX: d.elementX.value,
            elementY: d.elementY.value,
            outside: d.isOutside.value,
          }),
          [],
          'Move into the surface. Coordinates are relative to its border box.',
        ),
        surface: 'mouse',
      };
    }
    case 'useKeyPressed': {
      const d = use.useKeyPressed('k');
      return state(
        () => ({ key: 'k', pressed: d.pressed.value }),
        [],
        'Hold K outside a text field. Blur clears held keys.',
      );
    }
    case 'useKeyModifier': {
      const d = use.useKeyModifier('Shift');
      return state(
        () => ({ modifier: 'Shift', active: d.active.value }),
        [],
        'Hold Shift. Release it or leave this window to clear the state.',
      );
    }
    case 'useDevicePixelRatio': {
      const d = use.useDevicePixelRatio();
      return state(
        () => ({ pixelRatio: d.pixelRatio.value }),
        [],
        'Change browser zoom or move this window between displays.',
      );
    }
    case 'useIntervalFn': {
      const ticks = ref(0);
      const d = use.useIntervalFn(() => ticks.value++, 1000);
      return state(
        () => ({ ticks: ticks.value, active: d.isActive.value }),
        [action('Pause', d.pause), action('Resume', d.resume)],
      );
    }
    case 'useTimeoutFn': {
      const ticks = ref(0);
      const d = use.useTimeoutFn(() => ticks.value++, 1500, { immediate: false });
      return state(
        () => ({ completed: ticks.value, pending: d.isPending.value }),
        [action('Start timeout', d.start), action('Cancel', d.cancel)],
      );
    }
    case 'useRafFn': {
      const elapsed = ref(0);
      const d = use.useRafFn(({ delta }) => {
        elapsed.value += delta;
      });
      return state(
        () => ({
          elapsedMs: Math.round(elapsed.value),
          active: d.isActive.value,
          supported: d.isSupported,
        }),
        [action('Pause', d.pause), action('Resume', d.resume)],
      );
    }
    case 'useIdleCallback': {
      const remaining = ref<number | null>(null);
      const d = use.useIdleCallback(
        (deadline) => {
          remaining.value = deadline.timeRemaining();
        },
        { immediate: false },
      );
      return state(
        () => ({ supported: d.isSupported, pending: d.isPending.value, budgetMs: remaining.value }),
        [action('Schedule idle work', d.start), action('Cancel', d.cancel)],
      );
    }
    case 'usePermission': {
      const d = use.usePermission({ name: 'geolocation' });
      return state(
        () => ({
          supported: d.isSupported,
          state: d.state.value,
          error: d.error.value ? String(d.error.value) : null,
        }),
        [action('Query again', d.query)],
        'Queries permission state. It never requests your location.',
      );
    }
    case 'useSupported': {
      const d = use.useSupported(() => 'ResizeObserver' in window);
      return state(
        () => ({
          resizeObserver: d.isSupported.value,
          clipboard: !!navigator.clipboard,
          idleCallback: 'requestIdleCallback' in window,
        }),
        [],
        'Feature detection without user-agent guessing.',
      );
    }
    default:
      throw new Error(`Unknown demo: ${name}`);
  }
}

export function useDemoReadout(demo: Demo): ComputedRef<string> {
  return computed(() => JSON.stringify(demo.read(), null, 2));
}
