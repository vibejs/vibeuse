import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
    alias: process.env.VIBEUSE_UI_SOURCE
      ? [{ find: /^@usevibejs\/ui$/, replacement: resolve(process.env.VIBEUSE_UI_SOURCE) }]
      : [],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { 100: true, perFile: true },
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'json-summary', 'html'],
    },
  },
});
