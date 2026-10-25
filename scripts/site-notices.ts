import { readFileSync, writeFileSync } from 'node:fs';
writeFileSync(
  'artifacts/site/THIRD-PARTY-NOTICES.txt',
  'VibeUse: MIT\n\n' +
    readFileSync('LICENSE', 'utf8') +
    '\n\nmarked: MIT\n\n' +
    readFileSync('node_modules/marked/LICENSE', 'utf8'),
);
