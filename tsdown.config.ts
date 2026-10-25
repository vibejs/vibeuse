import { defineConfig } from 'tsdown';
export default defineConfig({
  entry: { index: 'src/index.ts', reactivity: 'src/reactivity/index.ts', browser: 'src/browser/index.ts', storage: 'src/storage/index.ts', elements: 'src/elements/index.ts', sensors: 'src/sensors/index.ts', timers: 'src/timers/index.ts' },
  format: 'esm', platform: 'browser', target: 'es2022', dts: true,
  sourcemap: true, clean: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  deps: { neverBundle: ['@usevibejs/ui'] },
});
