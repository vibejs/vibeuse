import { expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from '@usevibejs/ui';
import {
  useDevicePixelRatio,
  useKeyModifier,
  useKeyPressed,
  useMouse,
  useMouseInElement,
} from './index.ts';
import { mediaMock, observerMock } from '../../test/browser-mocks.ts';

it('tracks viewport and page mouse coordinates with replaceable event targets', () => {
  const a = document.createElement('div');
  const b = document.createElement('div');
  const target = shallowRef<EventTarget | null>(a);
  const client = useMouse({ target });
  const page = useMouse({ target, type: 'page', initialX: 4, initialY: 5 });
  expect(page.x.value).toBe(4);
  const event = new MouseEvent('mousemove', { clientX: 10, clientY: 20 });
  Object.defineProperties(event, { pageX: { value: 110 }, pageY: { value: 220 } });
  a.dispatchEvent(event);
  expect(client.x.value).toBe(10);
  expect(client.y.value).toBe(20);
  expect(page.x.value).toBe(110);
  expect(page.y.value).toBe(220);
  target.value = b;
  a.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
  expect(client.x.value).toBe(10);
  client.stop();
  page.stop();
});
it('calculates element-relative client coordinates and outside state', () => {
  observerMock('ResizeObserver');
  const el = document.createElement('div');
  document.body.append(el);
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 10,
    y: 20,
    left: 10,
    top: 20,
    right: 110,
    bottom: 70,
    width: 100,
    height: 50,
    toJSON: () => ({}),
  });
  const mouse = useMouseInElement(el);
  expect(mouse.isOutside.value).toBe(true);
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));
  expect(mouse.elementX.value).toBe(20);
  expect(mouse.elementY.value).toBe(20);
  expect(mouse.isOutside.value).toBe(false);
  document.dispatchEvent(new MouseEvent('mouseleave'));
  expect(mouse.isOutside.value).toBe(true);
  mouse.stop();
});
it('releases keys globally after focus moves, ignores editable fields and clears on blur', () => {
  const el = document.createElement('div');
  const input = document.createElement('input');
  el.append(input);
  document.body.append(el);
  const key = useKeyPressed('k', { target: el });
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
  expect(key.pressed.value).toBe(false);
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
  expect(key.pressed.value).toBe(true);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
  expect(key.pressed.value).toBe(false);
  el.dispatchEvent(new KeyboardEvent('keydown', { code: 'k' }));
  window.dispatchEvent(new Event('blur'));
  expect(key.pressed.value).toBe(false);
  key.stop();
  const allowed = useKeyPressed('KeyK', { target: el, includeInputs: true });
  input.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', bubbles: true }));
  expect(allowed.pressed.value).toBe(true);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta' }));
  expect(allowed.pressed.value).toBe(false);
  allowed.stop();
});
it('keeps modifiers synchronized and resets them on blur, hidden documents and target replacement', async () => {
  const target = shallowRef<EventTarget | null>(window);
  const modifier = useKeyModifier('Shift', { target });
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
  expect(modifier.active.value).toBe(true);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
  expect(modifier.active.value).toBe(false);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
  target.value = document;
  expect(modifier.active.value).toBe(false);
  document.dispatchEvent(new KeyboardEvent('keydown', { shiftKey: true }));
  window.dispatchEvent(new Event('blur'));
  expect(modifier.active.value).toBe(false);
  document.dispatchEvent(new KeyboardEvent('keydown', { shiftKey: true }));
  Object.defineProperty(document, 'hidden', { value: true, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(modifier.active.value).toBe(false);
  modifier.stop();
  await nextTick();
});
it('rearms resolution queries as device pixel ratio changes', () => {
  const { queries } = mediaMock();
  const ratio = useDevicePixelRatio();
  expect(ratio.pixelRatio.value).toBe(window.devicePixelRatio);
  Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
  queries[0].change(true);
  expect(ratio.pixelRatio.value).toBe(2);
  expect(queries.at(-1)?.media).toBe('(resolution: 2dppx)');
  window.dispatchEvent(new Event('resize'));
  ratio.stop();
  vi.stubGlobal('matchMedia', undefined);
  const noMedia = useDevicePixelRatio();
  noMedia.stop();
});
it('resets held keys when a document becomes hidden and ignores unrelated keyup', () => {
  const key = useKeyPressed('k');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'j' }));
  expect(key.pressed.value).toBe(true);
  Object.defineProperty(document, 'hidden', { value: true, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(key.pressed.value).toBe(false);
  key.stop();
});
it('supports editable-field modifier filtering and contenteditable ancestors', () => {
  const container = document.createElement('div');
  container.setAttribute('contenteditable', 'true');
  const nested = document.createElement('span');
  container.append(nested);
  document.body.append(container);
  const m = useKeyModifier('Shift', { target: container, includeInputs: false });
  nested.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, shiftKey: true }));
  expect(m.active.value).toBe(false);
  container.removeAttribute('contenteditable');
  nested.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, shiftKey: true }));
  expect(m.active.value).toBe(true);
  window.dispatchEvent(new KeyboardEvent('keyup', { shiftKey: false }));
  expect(m.active.value).toBe(false);
  m.stop();
});
it('retains held state when visibility changes to visible and handles modifier release from editable descendants', () => {
  Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  const key = useKeyPressed('k');
  const modifier = useKeyModifier('Shift');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', shiftKey: true }));
  document.dispatchEvent(new Event('visibilitychange'));
  expect(key.pressed.value).toBe(true);
  expect(modifier.active.value).toBe(true);
  key.stop();
  modifier.stop();
  const el = document.createElement('div');
  document.body.append(el);
  const m = useKeyModifier('Shift', { target: el, includeInputs: false });
  el.dispatchEvent(new KeyboardEvent('keydown', { shiftKey: true }));
  el.contentEditable = 'true';
  el.setAttribute('contenteditable', 'true');
  el.dispatchEvent(new KeyboardEvent('keyup', { shiftKey: false, bubbles: true }));
  expect(m.active.value).toBe(false);
  m.stop();
});
it('ignores a queued resolution notification after its scope stops', () => {
  const { queries } = mediaMock();
  const add = vi.spyOn(EventTarget.prototype, 'addEventListener');
  const ratio = useDevicePixelRatio();
  const callback = add.mock.calls.find((call) => call[0] === 'change')![1];
  ratio.stop();
  if (typeof callback === 'function') callback.call(queries[0], new Event('change'));
  expect(queries).toHaveLength(1);
});
it('recognizes plaintext and mixed-case editable contexts while honoring explicit opt-outs', () => {
  const parent = document.createElement('div');
  parent.setAttribute('contenteditable', 'true');
  const child = document.createElement('div');
  parent.append(child);
  document.body.append(parent);
  const key = useKeyPressed('k');
  for (const value of ['plaintext-only', 'TRUE', '', 'inherit']) {
    child.setAttribute('contenteditable', value);
    child.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
    expect(key.pressed.value).toBe(false);
  }
  child.setAttribute('contenteditable', 'false');
  child.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
  expect(key.pressed.value).toBe(true);
  key.stop();
});
it('releases a matched character when modifiers change its key value before keyup', () => {
  const key = useKeyPressed('k');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK' }));
  expect(key.pressed.value).toBe(true);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'K', code: 'KeyK', shiftKey: true }));
  expect(key.pressed.value).toBe(false);
  key.stop();
});
