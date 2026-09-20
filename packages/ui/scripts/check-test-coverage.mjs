#!/usr/bin/env node
/**
 * check-test-coverage.mjs
 *
 * Guards against test staleness by comparing the public exports in
 * packages/ui/src/index.ts with the test files on disk.
 *
 * Rules:
 *   - Every component directory exported from index.ts MUST have a
 *     co-located <ComponentName>.test.tsx file.
 *   - Non-component exports (theme/, tokens, etc.) are skipped automatically.
 *
 * Exit code:
 *   0 – all exported components have tests
 *   1 – one or more components are missing tests (lists them)
 *
 * Run:
 *   node packages/ui/scripts/check-test-coverage.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const INDEX_FILE = path.resolve(__dirname, '../src/index.ts');

// ─── Parse component names from index.ts ─────────────────────────────────────
// We look for lines like:  export * from './components/Foo/Foo';
//                      or: export * from './components/Foo';
const indexSource = fs.readFileSync(INDEX_FILE, 'utf8');
const componentExports = new Set();

for (const line of indexSource.split('\n')) {
  const match = line.match(/export \* from ['"]\.\/components\/([^/'"]+)/);
  if (match) {
    componentExports.add(match[1]);
  }
}

// ─── Check for test files ─────────────────────────────────────────────────────
const missing = [];

for (const name of componentExports) {
  const componentDir = path.join(COMPONENTS_DIR, name);

  // The component directory must exist
  if (!fs.existsSync(componentDir) || !fs.statSync(componentDir).isDirectory()) {
    missing.push({ name, reason: 'directory not found' });
    continue;
  }

  // It must contain a *.test.tsx file
  const entries = fs.readdirSync(componentDir);
  const hasTest = entries.some((f) => f.endsWith('.test.tsx') || f.endsWith('.test.ts'));

  if (!hasTest) {
    missing.push({ name, reason: 'no .test.tsx file found' });
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────
if (missing.length === 0) {
  console.log(`✅  All ${componentExports.size} exported components have tests.`);
  process.exit(0);
} else {
  console.error(
    `\n❌  Test coverage check failed — ${missing.length} component(s) are missing tests:\n`
  );
  for (const { name, reason } of missing) {
    console.error(`   • ${name}  (${reason})`);
  }
  console.error(
    `\n   Add a <ComponentName>.test.tsx inside each component directory above,\n` +
    `   or remove the export from packages/ui/src/index.ts if the component\n` +
    `   was deleted.\n`
  );
  process.exit(1);
}
