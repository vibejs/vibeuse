import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { effectScope, ref } from '@usevibejs/ui';
import { useEventListener, usePrevious, useRefHistory } from '../dist/index.js';
function measure(label: string, iterations: number, run: () => void) {
  for (let i = 0; i < 3; i++) run();
  const start = performance.now();
  run();
  const durationMs = performance.now() - start;
  return {
    label,
    iterations,
    durationMs,
    operationsPerSecond: Math.round((iterations / durationMs) * 1000),
  };
}
const updates = 100_000;
const events = 100_000;
const cycles = 10_000;
const results = [
  measure('synchronous updates with previous-value tracking', updates, () => {
    const scope = effectScope();
    const value = ref(0);
    scope.run(() => usePrevious(value));
    for (let n = 0; n < updates; n++) value.value = n;
    scope.stop();
  }),
  measure('native EventTarget event delivery', events, () => {
    const target = new EventTarget();
    let count = 0;
    const listener = useEventListener(target, 'sample', () => count++);
    const event = new Event('sample');
    for (let n = 0; n < events; n++) target.dispatchEvent(event);
    listener.stop();
    if (count !== events) throw new Error('Lost event');
  }),
  measure('scope creation/disposal with listener and bounded history', cycles, () => {
    const target = new EventTarget();
    for (let n = 0; n < cycles; n++) {
      const scope = effectScope();
      scope.run(() => {
        useEventListener(target, 'sample', () => {});
        useRefHistory(ref(0), { clone: (n) => n, capacity: 10 });
      });
      scope.stop();
    }
  }),
];
mkdirSync('artifacts', { recursive: true });
const report = {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  date: new Date().toISOString(),
  warmupRuns: 3,
  measuredRuns: 1,
  environment: 'Node native EventTarget; no browser layout benchmark',
  results,
};
writeFileSync('artifacts/benchmark.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
