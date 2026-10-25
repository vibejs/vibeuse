import { defineConfig } from 'vite';
import { vibe } from '@usevibejs/compiler/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vibe()],
  resolve: {
    alias: { '@usevibejs/use': fileURLToPath(new URL('../../src/index.ts', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        integration: fileURLToPath(new URL('integration.html', import.meta.url)),
      },
    },
    target: 'es2022',
    outDir: '../../artifacts/site',
    emptyOutDir: true,
  },
});
