// Regenerates src/tools/ascii-text-drawer/figlet-fonts.ts
//
// The ASCII text drawer used to fetch figlet fonts from a third-party CDN at
// runtime (unpkg), which silently failed (see issue #39). Instead we bundle the
// fonts from figlet/importable-fonts via lazy dynamic imports. This script keeps
// the importer map in sync with the font list declared in the tool component.
//
// Usage: node scripts/gen-figlet-fonts.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const componentPath = resolve(here, '../src/tools/ascii-text-drawer/ascii-text-drawer.vue');
const outPath = resolve(here, '../src/tools/ascii-text-drawer/figlet-fonts.ts');

const src = readFileSync(componentPath, 'utf8');
const match = src.match(/const fonts = \[(.*?)\];/s);
if (!match) {
  throw new Error('Could not find the `fonts` array in ascii-text-drawer.vue');
}

const names = [...match[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, '\''));
const unique = [...new Set(names)];

const escape = s => s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
const lines = unique.map(name => `  '${escape(name)}': () => import('figlet/importable-fonts/${escape(name)}.js'),`);

const output = `// AUTO-GENERATED — do not edit by hand.
// Maps each figlet font name to a lazy importer for its bundled .flf data
// (from figlet/importable-fonts), so fonts are served from our own bundle
// instead of being fetched from a third-party CDN at runtime. See issue #39.
// Regenerate with: node scripts/gen-figlet-fonts.mjs

export const figletFontImporters: Record<string, () => Promise<{ default: string }>> = {
${lines.join('\n')}
};
`;

writeFileSync(outPath, output);
console.log(`Wrote ${outPath} with ${unique.length} fonts`);
