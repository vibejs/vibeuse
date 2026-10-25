import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { functions } from '../docs/catalog.ts';
const server = await preview({
  configFile: 'examples/playground/vite.config.ts',
  preview: { host: '127.0.0.1', port: 0 },
});
const address = server.httpServer.address();
assert(address && typeof address !== 'string');
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
const errors: string[] = [];
const checks: string[] = [];
page.on('pageerror', (error) => errors.push(error.message));
async function route(name: string) {
  await page.goto(`${origin}/#/functions/${name}`);
  await page.locator(`[data-demo="${name}"]`).waitFor();
}
async function read() {
  return JSON.parse(await page.locator('.live-demo .readout').innerText());
}
async function until(check: () => Promise<boolean>, label: string) {
  for (let i = 0; i < 100; i++) {
    if (await check()) return;
    await page.waitForTimeout(20);
  }
  throw new Error(label);
}
try {
  // Instrument only global event targets and native resources, leaving DOM garbage collection to the browser.
  await context.addInitScript(() => {
    const listeners = new Map<EventTarget, Map<string, Set<EventListenerOrEventListenerObject>>>();
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const capture = (options?: boolean | AddEventListenerOptions) =>
      typeof options === 'boolean' ? options : !!options?.capture;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if ((this === window || this === document) && listener) {
        let map = listeners.get(this);
        if (!map) listeners.set(this, (map = new Map()));
        const key = type + ':' + capture(options);
        let set = map.get(key);
        if (!set) map.set(key, (set = new Set()));
        set.add(listener);
      }
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (listener)
        listeners
          .get(this)
          ?.get(type + ':' + capture(options))
          ?.delete(listener);
      return remove.call(this, type, listener, options);
    };
    const observers = new Set<object>();
    for (const name of ['ResizeObserver', 'IntersectionObserver', 'MutationObserver'] as const) {
      const Native = window[name];
      Object.defineProperty(window, name, {
        value: class extends Native {
          constructor(callback: never) {
            super(callback);
          }
          observe(...args: never[]) {
            observers.add(this);
            return Reflect.apply(Native.prototype.observe, this, args);
          }
          disconnect() {
            observers.delete(this);
            return super.disconnect();
          }
        },
      });
    }
    const intervals = new Set<ReturnType<typeof setInterval> | number | string>();
    const set = window.setInterval;
    const clear = window.clearInterval;
    window.setInterval = ((...args: Parameters<typeof setInterval>) => {
      const id = Reflect.apply(set, window, args);
      intervals.add(id);
      return id;
    }) as typeof setInterval;
    window.clearInterval = (id) => {
      if (id !== undefined) intervals.delete(id);
      clear(id);
    };
    Object.assign(window, {
      __resources: () => ({
        globalListeners: [...listeners.values()].reduce(
          (n, map) => n + [...map.values()].reduce((n, set) => n + set.size, 0),
          0,
        ),
        observers: observers.size,
        intervals: intervals.size,
      }),
    });
  });
  await page.goto(origin);
  await page.getByRole('heading', { name: 'Useful by nature. Reactive by Vibe.' }).waitFor();
  checks.push('documentation home');
  await page.getByRole('button', { name: 'Increment', exact: true }).click();
  assert.equal((await read()).count, 1);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  assert.equal((await read()).count, 0);
  checks.push('counter history');
  for (const fn of functions) {
    await page.goto(`${origin}/#/functions/${fn.name}`);
    await page.locator(`[data-demo="${fn.name}"] .readout`).waitFor();
    await read();
  }
  checks.push('all 42 production .vibe demos mount');
  await route('useDebounce');
  await page.getByRole('textbox', { name: 'useDebounce value' }).fill('search');
  assert.notEqual((await read()).debounced, 'search');
  await until(async () => (await read()).debounced === 'search', 'debounce did not settle');
  checks.push('debounced input');
  await route('useThrottle');
  await page.getByRole('textbox', { name: 'useThrottle value' }).fill('first');
  await page.getByRole('textbox', { name: 'useThrottle value' }).fill('latest');
  await until(async () => (await read()).throttled === 'latest', 'throttle did not settle');
  checks.push('throttled input');
  await route('useClipboard');
  await page.getByRole('textbox', { name: 'useClipboard value' }).fill('Native VibeUse');
  await page.getByRole('button', { name: 'Copy text', exact: true }).click();
  await until(async () => (await read()).copied, 'clipboard failed');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Native VibeUse');
  checks.push('native clipboard');
  await route('useLocalStorage');
  await page.getByRole('textbox', { name: 'useLocalStorage value' }).fill('Saved preference');
  await page.reload();
  assert.equal((await read()).saved, 'Saved preference');
  checks.push('storage reload persistence');
  await route('useDark');
  await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
  assert.equal(
    await page.locator('.demo-surface').evaluate((el) => el.classList.contains('dark')),
    (await read()).dark,
  );
  checks.push('targeted dark class');
  await route('useWindowSize');
  await page.setViewportSize({ width: 810, height: 700 });
  await until(async () => (await read()).width === 810, 'window resize');
  await page.setViewportSize({ width: 1280, height: 900 });
  checks.push('window size');
  await route('useMediaQuery');
  await page.setViewportSize({ width: 700, height: 800 });
  await until(async () => (await read()).matches === false, 'breakpoint false');
  await page.setViewportSize({ width: 1280, height: 900 });
  await until(async () => (await read()).matches === true, 'breakpoint true');
  checks.push('native breakpoint');
  await route('useElementSize');
  const previous = (await read()).width;
  await page.locator('.demo-surface').evaluate((el) => {
    (el as HTMLElement).style.width = '220px';
  });
  await until(async () => (await read()).width !== previous, 'resize observer');
  checks.push('native element resize');
  await route('useIntersectionObserver');
  await page.locator('.intersection-viewport').evaluate((el) => {
    el.scrollTop = 240;
  });
  await until(async () => (await read()).visible === true, 'intersection did not enter');
  await page.locator('.intersection-viewport').evaluate((el) => {
    el.scrollTop = 0;
  });
  await until(async () => (await read()).visible === false, 'intersection did not exit');
  checks.push('native intersection observer');
  await route('useScroll');
  await page.getByRole('button', { name: 'Scroll to end', exact: true }).click();
  await until(
    async () => (await read()).boundaries.bottom && (await read()).boundaries.right,
    'scroll boundaries',
  );
  checks.push('native two-axis scroll');
  await route('useFocus');
  await page.getByRole('button', { name: 'Focus field', exact: true }).click();
  assert.equal((await read()).focused, true);
  checks.push('focus control');
  await route('useClickOutside');
  await page.getByRole('button', { name: 'Open dropdown', exact: true }).click();
  assert.equal((await read()).dropdownOpen, true);
  await page.locator('.function-heading>h1').click();
  assert.equal((await read()).dropdownOpen, false);
  checks.push('pointer outside');
  await route('useMouseInElement');
  const rect = await page.locator('.demo-surface').boundingBox();
  assert(rect);
  await page.mouse.move(rect.x + 30, rect.y + 30);
  await until(async () => (await read()).outside === false, 'element mouse');
  checks.push('element mouse coordinates');
  await route('useKeyPressed');
  await page.keyboard.down('k');
  assert.equal((await read()).pressed, true);
  await page.keyboard.up('k');
  assert.equal((await read()).pressed, false);
  checks.push('keyboard release');
  await route('useIntervalFn');
  await until(async () => (await read()).ticks >= 1, 'interval');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  assert.equal((await read()).active, false);
  checks.push('interval controls');
  // Keep the same application alive while each demo is replaced to verify component scope disposal.
  await route('useCounter');
  const resources = () =>
    page.evaluate(() =>
      (
        window as unknown as {
          __resources(): { globalListeners: number; observers: number; intervals: number };
        }
      ).__resources(),
    );
  const baseline = await resources();
  for (let cycle = 0; cycle < 3; cycle++)
    for (const name of [
      'useElementSize',
      'useIntersectionObserver',
      'useScroll',
      'useMouse',
      'useIntervalFn',
      'useKeyModifier',
    ]) {
      await page.evaluate((name) => {
        location.hash = `#/functions/${name}`;
      }, name);
      await page.locator(`[data-demo="${name}"]`).waitFor();
      await page.evaluate(() => {
        location.hash = '#/functions/useCounter';
      });
      await page.locator('[data-demo="useCounter"]').waitFor();
      assert.deepEqual(await resources(), baseline);
    }
  checks.push('18 route mount/unmount cycles leave no global listener/observer/interval growth');
  await page.goto(`${origin}/integration.html`);
  await page.locator('#one .measured').waitFor();
  await until(
    async () => (await page.locator('#one .measured').innerText()) === '120',
    'fixture layout',
  );
  await page.locator('#one .increment').click();
  assert.equal(await page.locator('#one .count').innerText(), '1');
  assert.equal(await page.locator('#two .count').innerText(), '0');
  await page.locator('#one .emit').click();
  assert.equal(await page.locator('#two .event-value').innerText(), '0');
  await page.locator('#one .replace').click();
  await until(
    async () => (await page.locator('#one .measured').innerText()) === '0',
    'target unmount',
  );
  await page.locator('#one .replace').click();
  await until(
    async () => (await page.locator('#one .measured').innerText()) === '120',
    'target remount',
  );
  for (let cycle = 0; cycle < 15; cycle++) {
    await page.evaluate(() =>
      (window as unknown as { __vibeuseFixtures: { unmount(): void } }).__vibeuseFixtures.unmount(),
    );
    assert.deepEqual(await resources(), { globalListeners: 0, observers: 0, intervals: 0 });
    await page.evaluate(() =>
      (window as unknown as { __vibeuseFixtures: { mount(): void } }).__vibeuseFixtures.mount(),
    );
  }
  checks.push('independent applications and 30 fixture app teardown cycles');
  await page.goto(origin);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.locator('body').evaluate((el) => el.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('searchbox').fill('clipboard');
  assert.equal(await page.locator('.function-link').count(), 1);
  checks.push('responsive searchable index');
  mkdirSync('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/documentation.png', fullPage: true });
  assert.deepEqual(errors, []);
  const report = { browser: await browser.version(), checks, consoleErrors: errors, passed: true };
  writeFileSync('artifacts/browser-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  mkdirSync('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/browser-failure.png', fullPage: true });
  console.error({ pageErrors: errors, url: page.url() });
  throw error;
} finally {
  await browser.close();
  await server.close();
}
