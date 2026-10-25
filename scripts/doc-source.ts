import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { functions } from '../docs/catalog.ts';

export function declarations(): string {
  return readdirSync('dist')
    .filter((file) => file.endsWith('.d.ts'))
    .map((file) => readFileSync(`dist/${file}`, 'utf8'))
    .join('\n');
}
export function signature(name: string, source: string): string {
  const start = source.indexOf(`declare function ${name}`);
  if (start < 0) throw new Error(`Missing built declaration for ${name}`);
  let braces = 0;
  let parens = 0;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '(') parens++;
    if (c === ')') parens--;
    if (c === ';' && braces === 0 && parens === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Unterminated signature for ${name}`);
}
export function typeExamples(): string {
  const source = `// Generated from documentation examples by scripts/generate-docs.ts.\nimport { ref, shallowRef, computed } from '@usevibejs/ui';\nimport { ${functions.map((fn) => fn.name).join(', ')} } from '../src/index.ts';\n${functions
    .map((fn) => {
      const bindings = [...fn.code.matchAll(/const\s+(?:\{([^}]+)\}|(\w+))\s*=/g)].flatMap(
        (match) =>
          match[1]
            ? match[1].split(',').map((binding) => binding.trim().split(':').at(-1)!.trim())
            : [match[2]],
      );
      return `function ${fn.name}Example() {\n${fn.code}\nreturn { ${bindings.join(', ')} };\n}\nvoid ${fn.name}Example;`;
    })
    .join('\n')}\n`;
  return execFileSync('pnpm', ['exec', 'oxfmt', '--stdin-filepath', 'test/docs.test-d.ts'], {
    input: source,
    encoding: 'utf8',
  });
}
