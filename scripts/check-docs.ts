import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { compile } from '@usevibejs/compiler';
import { functions } from '../docs/catalog.ts';
import { declarations, signature, typeExamples } from './doc-source.ts';
assert.equal(functions.length, 42);
assert.equal(new Set(functions.map((fn) => fn.name)).size, 42);
const runtime = await import('../dist/index.js');
assert.deepEqual(
  Object.keys(runtime)
    .filter((name) => name.startsWith('use'))
    .sort(),
  functions.map((fn) => fn.name).sort(),
);
const snippets = readFileSync('test/docs.test-d.ts', 'utf8');
assert.equal(snippets, typeExamples(), 'Typed documentation fixture drift');
const source = declarations();
const demos = readFileSync('examples/playground/src/demos.ts', 'utf8');
for (const fn of functions) {
  const markdown = readFileSync(`docs/functions/${fn.name}.md`, 'utf8');
  assert(markdown.includes(fn.code), `${fn.name}: documentation sample drift`);
  assert(markdown.includes(signature(fn.name, source)), `${fn.name}: missing generated signature`);
  assert(demos.includes(`'${fn.name}'`), `${fn.name}: missing live demo`);
}
let sfcCount = 0;
for (const group of ['getting-started', 'guide', 'advanced', 'functions']) {
  for (const file of readdirSync(`docs/${group}`)) {
    const markdown = readFileSync(`docs/${group}/${file}`, 'utf8');
    for (const match of markdown.matchAll(/```vibe\n([\s\S]*?)```/g)) {
      const result = compile(match[1], {
        filename: `${group}/${file}.vibe`,
        id: 'doccheck',
        dev: false,
      });
      assert.deepEqual(result.diagnostics, [], `${file}: .vibe compilation failed`);
      sfcCount++;
    }
  }
}
console.log(
  `Verified 42 function pages, 42 typed samples, 42 live demos and ${sfcCount} guide component.`,
);

for (const file of readdirSync('examples/playground/src').filter((file) =>
  file.endsWith('.vibe'),
)) {
  const source = readFileSync(`examples/playground/src/${file}`, 'utf8');
  const result = compile(source, { filename: file, id: 'sfccheck', dev: false });
  assert.deepEqual(result.diagnostics, [], `${file}: unsupported component syntax`);
}
