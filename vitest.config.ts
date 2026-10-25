import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom', include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    restoreMocks: true, unstubGlobals: true, setupFiles: ['test/setup.ts'],
    coverage: { provider: 'v8', include: ['src/**/*.ts'], exclude: ['**/*.test.ts', '**/index.ts'], reporter: ['text', 'json-summary', 'html'] },
  },
});
