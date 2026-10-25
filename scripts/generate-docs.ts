import { readFileSync, writeFileSync } from 'node:fs';
import { functions } from '../docs/catalog.ts';
import { declarations, signature, typeExamples } from './doc-source.ts';
const source = declarations();
for (const fn of functions) {
  writeFileSync(
    `docs/functions/${fn.name}.md`,
    `# ${fn.name}\n\n${fn.description}\n\n[Open the interactive .vibe example](#/functions/${fn.name})\n\n## Usage\n\n\`\`\`ts\nimport { ref, shallowRef, computed } from '@usevibejs/ui';\nimport { ${fn.name} } from '@usevibejs/use';\n\n${fn.code}\n\`\`\`\n\n## Signature\n\nGenerated from the built public declarations.\n\n\`\`\`ts\n${signature(fn.name, source)}\n\`\`\`\n\n## Options\n\n${fn.options}\n\n## Return values\n\n${fn.returns}\n\n## Browser compatibility and limitations\n\n${fn.limitation}\n\n## Cleanup\n\n${['useCounter', 'useToggle', 'useCycle', 'useSupported'].includes(fn.name) ? 'This utility allocates no external resources.' : 'The calling Vibe.js effect scope owns all watchers and native resources. stop() is idempotent and permanently stops this instance. Outside an active scope, call stop() yourself. No asynchronous result is applied after disposal.'}\n`,
  );
}
writeFileSync('test/docs.test-d.ts', typeExamples());

const guide = readFileSync('docs/getting-started/quick-start.md', 'utf8');
writeFileSync('examples/playground/src/QuickStart.vibe', guide.match(/```vibe\n([\s\S]*?)```/)![1]);
