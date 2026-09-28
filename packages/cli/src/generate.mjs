import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FEATURES } from './features.mjs';

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FEATURE_TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
export const REPO_ROOT = path.resolve(CLI_ROOT, '../..');

const TEMPLATE_PORT = 5700;
const FIRST_EXAMPLE_PORT = 5710;
const SKIPPED_ENTRIES = new Set(['node_modules', 'dist', '.turbo', 'coverage']);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

/**
 * Resolves the version range generated apps should use for a dependency.
 * Workspace packages resolve to "*"; third-party packages reuse the range
 * already pinned by a scaffold package so everything stays in lockstep.
 *
 * @param {string} repoRoot
 * @param {string} dependency
 */
export function resolveDependencyVersion(repoRoot, dependency) {
  if (dependency.startsWith('@scaffold/')) return '*';

  const packagesDir = path.join(repoRoot, 'packages');
  for (const entry of fs.readdirSync(packagesDir)) {
    const manifestPath = path.join(packagesDir, entry, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    const range = manifest.devDependencies?.[dependency] ?? manifest.dependencies?.[dependency];
    if (range) return range;
  }

  throw new Error(`Could not resolve a version for "${dependency}" from packages/*/package.json.`);
}

/**
 * Picks the first port >= 5710 not claimed by a Vite config or an OS process.
 *
 * @param {string} repoRoot
 */
export async function findFreePort(repoRoot) {
  const used = new Set();
  for (const group of ['apps', 'examples']) {
    const groupDir = path.join(repoRoot, group);
    if (!fs.existsSync(groupDir)) continue;
    for (const entry of fs.readdirSync(groupDir)) {
      const configPath = path.join(groupDir, entry, 'vite.config.ts');
      if (!fs.existsSync(configPath)) continue;
      const match = fs.readFileSync(configPath, 'utf-8').match(/port:\s*(\d+)/);
      if (match) used.add(Number(match[1]));
    }
  }

  for (let port = FIRST_EXAMPLE_PORT; port <= 65535; port += 1) {
    if (used.has(port)) continue;
    if (await isPortFree(port)) return port;
  }
  throw new Error('No available port found between 5710 and 65535.');
}

// macOS lets the wildcard address bind while a loopback address holds the same
// port, and Vite listens on localhost, so each loopback is probed separately.
const PROBE_HOSTS = [undefined, '127.0.0.1', '::1'];

async function isPortFree(port) {
  for (const host of PROBE_HOSTS) {
    const available = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE' || error.code === 'EACCES') resolve(false);
        else if (error.code === 'EADDRNOTAVAIL' || error.code === 'EAFNOSUPPORT') resolve(true);
        else reject(error);
      });
      server.listen(port, host, () => {
        server.close((error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    });
    if (!available) return false;
  }
  return true;
}

function replaceInFile(file, search, replacement) {
  const original = fs.readFileSync(file, 'utf-8');
  if (!original.includes(search)) {
    throw new Error(`Template drift: expected "${search}" in ${path.basename(file)}.`);
  }
  fs.writeFileSync(file, original.split(search).join(replacement), 'utf-8');
}

/**
 * Copies apps/template into `targetDir` and applies name, title, port, and
 * feature transforms. Pure filesystem work — no network, no npm install.
 *
 * @param {{
 *   repoRoot: string;
 *   targetDir: string;
 *   name: string;
 *   title: string;
 *   port: number;
 *   features: string[];
 * }} options
 */
export function generateApp({ repoRoot, targetDir, name, title, port, features }) {
  const templateDir = path.join(repoRoot, 'apps', 'template');
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template not found at ${templateDir}.`);
  }
  if (fs.existsSync(targetDir)) {
    throw new Error(`${path.relative(repoRoot, targetDir) || targetDir} already exists.`);
  }

  try {
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });
    fs.cpSync(templateDir, targetDir, {
      recursive: true,
      filter: (source) => !SKIPPED_ENTRIES.has(path.basename(source)),
    });

    const manifestPath = path.join(targetDir, 'package.json');
    const manifest = readJson(manifestPath);
    manifest.name = name;

    for (const feature of features) {
      const definition = FEATURES[feature];
      if (!definition) throw new Error(`Unknown feature "${feature}".`);

      for (const dependency of definition.dependencies) {
        manifest.dependencies[dependency] ??= resolveDependencyVersion(repoRoot, dependency);
      }
      for (const file of definition.files) {
        const destination = path.join(targetDir, file.to);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(FEATURE_TEMPLATES_DIR, file.from), destination);
      }
    }

    manifest.dependencies = Object.fromEntries(
      Object.entries(manifest.dependencies).sort(([a], [b]) => a.localeCompare(b)),
    );
    writeJson(manifestPath, manifest);

    replaceInFile(path.join(targetDir, 'vite.config.ts'), `port: ${TEMPLATE_PORT}`, `port: ${port}`);
    replaceInFile(
      path.join(targetDir, 'index.html'),
      '<title>Scaffold App Template</title>',
      `<title>${escapeHtml(title)}</title>`,
    );
    replaceInFile(path.join(targetDir, 'src/routes/index.tsx'), 'Scaffold App', escapeJsxText(title));
    replaceInFile(path.join(targetDir, 'src/template.test.tsx'), "'Scaffold App'", JSON.stringify(title));

    fs.renameSync(
      path.join(targetDir, 'src/template.test.tsx'),
      path.join(targetDir, 'src/app.test.tsx'),
    );

    return { targetDir, port };
  } catch (error) {
    try {
      fs.rmSync(targetDir, { recursive: true, force: true });
    } catch {
      // Preserve the generation error if cleanup also fails.
    }
    throw error;
  }
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeJsxText(value) {
  return value.replace(/[{}<>]/g, (char) => `{'${char}'}`);
}

/**
 * Ensures the root package.json lists `examples/*` as a workspace glob.
 *
 * @param {string} repoRoot
 * @returns {boolean} whether the manifest was changed
 */
export function ensureExamplesWorkspace(repoRoot) {
  const manifestPath = path.join(repoRoot, 'package.json');
  const manifest = readJson(manifestPath);
  const workspaces = manifest.workspaces ?? [];
  if (workspaces.includes('examples/*')) return false;
  manifest.workspaces = [...workspaces, 'examples/*'];
  writeJson(manifestPath, manifest);
  return true;
}
