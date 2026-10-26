import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), 'vibeuse-consumer-'));
try {
  execFileSync('pnpm', ['pack', '--pack-destination', temp], { cwd: root, stdio: 'pipe' });
  const tar = readdirSync(temp).find((name) => name.endsWith('.tgz'))!;
  mkdirSync(join(temp, 'consumer'));
  const consumer = join(temp, 'consumer');
  const workspaceStore = execFileSync('pnpm', ['store', 'path', '--silent'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  const store = dirname(workspaceStore);
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'vibeuse-external-consumer',
      private: true,
      type: 'module',
      dependencies: {
        '@usevibejs/use': `file:../${tar}`,
        '@usevibejs/ui': '0.1.0',
        typescript: '7.0.2',
      },
    }),
  );
  // A temporary consumer can select a different default store from the workspace. Select the
  // installed workspace's store explicitly, resolve exact metadata, and prefetch before going offline.
  assert.equal(
    execFileSync('pnpm', ['store', 'path', '--store-dir', store, '--silent'], {
      cwd: consumer,
      encoding: 'utf8',
    }).trim(),
    workspaceStore,
  );
  execFileSync('pnpm', ['install', '--lockfile-only', '--ignore-scripts', '--store-dir', store], {
    cwd: consumer,
    stdio: 'pipe',
  });
  execFileSync('pnpm', ['fetch', '--ignore-scripts', '--store-dir', store], {
    cwd: consumer,
    stdio: 'pipe',
  });
  execFileSync(
    'pnpm',
    ['install', '--offline', '--frozen-lockfile', '--ignore-scripts', '--store-dir', store],
    { cwd: consumer, stdio: 'pipe' },
  );
  const manifest = JSON.parse(
    readFileSync(join(consumer, 'node_modules/@usevibejs/use/package.json'), 'utf8'),
  );
  assert.equal(manifest.peerDependencies['@usevibejs/ui'], '^0.1.0');
  assert.equal(manifest.sideEffects, false);
  assert(!manifest.dependencies);
  for (const [name, range] of Object.entries(manifest.devDependencies ?? {}))
    assert(
      !String(range).includes('link:') && !String(range).includes('file:'),
      `local path: ${name}`,
    );
  const exported = Object.keys(manifest.exports).map((key) =>
    key === '.' ? '@usevibejs/use' : `@usevibejs/use${key.slice(1)}`,
  );
  writeFileSync(
    join(consumer, 'check.mjs'),
    `import assert from 'node:assert/strict';\n${exported.map((entry, i) => `const m${i} = await import('${entry}'); assert(Object.keys(m${i}).length > 0);`).join('\n')}\nassert.equal(Object.keys(m0).length, 42); const c = m0.useCounter(); c.inc(); assert.equal(c.count.value, 1);`,
  );
  execFileSync('node', ['check.mjs'], { cwd: consumer, stdio: 'pipe' });
  writeFileSync(
    join(consumer, 'consumer.ts'),
    `import { computed, ref } from '@usevibejs/ui';\nimport { useDebounce, useRefHistory, useStorage } from '@usevibejs/use';\nimport { useEventListener } from '@usevibejs/use/browser';\nconst input = ref<'a' | 'b'>('a'); const delayed = useDebounce(computed(() => input.value)); const value: 'a' | 'b' = delayed.value.value;\nuseRefHistory(input, { clone: value => value }); useStorage('key', 1, { serializer: { read: Number, write: String } });\nuseEventListener(window, 'keydown', event => console.log(event.key));\n// @ts-expect-error readonly computed is not a writable history source\nuseRefHistory(computed(() => 1), { clone: (n: number) => n });\nvoid value;\n`,
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'es2022',
        module: 'nodenext',
        strict: true,
        noEmit: true,
        lib: ['es2024', 'dom'],
      },
      include: ['consumer.ts'],
    }),
  );
  execFileSync('pnpm', ['exec', 'tsc'], { cwd: consumer, stdio: 'pipe' });
  const measure = async (name: string, source: string) => {
    writeFileSync(join(consumer, `${name}.ts`), source);
    const result = await build({
      configFile: false,
      root: consumer,
      logLevel: 'silent',
      build: {
        write: false,
        minify: true,
        lib: { entry: join(consumer, `${name}.ts`), formats: ['es'] },
        rolldownOptions: { external: ['@usevibejs/ui'] },
      },
    });
    const outputs = Array.isArray(result)
      ? result.flatMap((r) => r.output)
      : 'output' in result
        ? result.output
        : [];
    const code = outputs
      .filter((output) => output.type === 'chunk')
      .map((output) => output.code)
      .join('\n');
    assert(
      !code.includes('class RefImpl') && !code.includes('class ReactiveEffect'),
      'Bundled a duplicate reactive runtime',
    );
    return { bytes: Buffer.byteLength(code), gzipBytes: gzipSync(code).length, code };
  };
  const single = await measure('counter', `export { useCounter } from '@usevibejs/use';`);
  const category = await measure(
    'category',
    `export { useCounter } from '@usevibejs/use/reactivity';`,
  );
  const full = await measure('full', `export * from '@usevibejs/use';`);
  assert.equal(single.code, category.code);
  assert(single.bytes < full.bytes / 5);
  assert(!/ResizeObserver|clipboard|localStorage/.test(single.code));
  const graph = readdirSync(resolve('dist')).filter((name) => name.endsWith('.js'));
  const sourceBytes = graph.reduce(
    (total, name) => total + Buffer.byteLength(readFileSync(resolve('dist', name))),
    0,
  );
  const report = {
    exports: exported,
    consumerInstall: 'passed (frozen offline packed artifact with explicit prefetched store)',
    consumerTypes: 'passed (NodeNext, strict, skipLibCheck false)',
    peerExternal: true,
    runtimeDependencies: 0,
    packedBytes: readFileSync(join(temp, tar)).length,
    allEsmFilesBytes: sourceBytes,
    counter: { bytes: single.bytes, gzipBytes: single.gzipBytes },
    full: { bytes: full.bytes, gzipBytes: full.gzipBytes },
    unusedBrowserCodeRemoved: true,
  };
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/package-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (error && typeof error === 'object' && 'stdout' in error)
    console.error(String(error.stdout), String((error as { stderr?: unknown }).stderr ?? ''));
  throw error;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
