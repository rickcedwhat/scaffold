import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCliArgs, titleFromName, validateName } from './args.mjs';
import {
  REPO_ROOT,
  ensureExamplesWorkspace,
  findFreePort,
  generateApp,
  resolveDependencyVersion,
} from './generate.mjs';
import { main } from './main.mjs';
import { registerWithDashboard } from './register.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-cli-'));
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function read(file) {
  return fs.readFileSync(file, 'utf-8');
}

/** Minimal copy of the monorepo layout the generator depends on. */
function createFixtureRepo(root) {
  fs.cpSync(path.join(REPO_ROOT, 'apps/template'), path.join(root, 'apps/template'), {
    recursive: true,
    filter: (source) => !['node_modules', 'dist'].includes(path.basename(source)),
  });
  for (const pkg of ['core', 'feedback']) {
    fs.mkdirSync(path.join(root, 'packages', pkg), { recursive: true });
    fs.copyFileSync(
      path.join(REPO_ROOT, 'packages', pkg, 'package.json'),
      path.join(root, 'packages', pkg, 'package.json'),
    );
  }
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'fixture', private: true, workspaces: ['packages/*', 'apps/*'] }),
  );
}

describe('args', () => {
  it('validates kebab-case names and rejects reserved ones', () => {
    expect(validateName('recipe-box')).toBeNull();
    expect(validateName('RecipeBox')).toMatch(/kebab-case/);
    expect(validateName('recipe--box')).toMatch(/kebab-case/);
    expect(validateName('demo')).toMatch(/collides/);
    expect(validateName('')).toMatch(/required/);
  });

  it('derives a title from the name', () => {
    expect(titleFromName('recipe-box')).toBe('Recipe Box');
  });

  it('parses new with features, title, port, and --no-register', () => {
    expect(
      parseCliArgs([
        'new',
        'recipe-box',
        '--with',
        'forms, feedback,forms',
        '--title',
        'Recipes',
        '--port',
        '5800',
        '--no-register',
      ]),
    ).toEqual({
      command: 'new',
      name: 'recipe-box',
      title: 'Recipes',
      port: 5800,
      features: ['forms', 'feedback'],
      register: false,
    });
  });

  it('returns help without a command and rejects bad input', () => {
    expect(parseCliArgs([])).toEqual({ command: 'help' });
    expect(parseCliArgs(['--help'])).toEqual({ command: 'help' });
    expect(() => parseCliArgs(['make', 'x'])).toThrow(/Unknown command/);
    expect(() => parseCliArgs(['new', 'app', '--with', 'auth'])).toThrow(/Unknown feature/);
    expect(() => parseCliArgs(['new', 'app', '--port', '80'])).toThrow(/--port/);
  });
});

describe('generateApp', () => {
  it('copies the template and rewrites name, title, and port', () => {
    const targetDir = path.join(tmpDir, 'examples/recipe-box');
    generateApp({
      repoRoot: REPO_ROOT,
      targetDir,
      name: 'recipe-box',
      title: 'Recipe Box',
      port: 5711,
      features: [],
    });

    expect(fs.existsSync(path.join(targetDir, 'node_modules'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, 'dist'))).toBe(false);
    expect(JSON.parse(read(path.join(targetDir, 'package.json'))).name).toBe('recipe-box');
    expect(read(path.join(targetDir, 'vite.config.ts'))).toContain('port: 5711');
    expect(read(path.join(targetDir, 'index.html'))).toContain('<title>Recipe Box</title>');
    expect(read(path.join(targetDir, 'src/routes/index.tsx'))).toContain('Recipe Box');
    expect(read(path.join(targetDir, 'src/app.test.tsx'))).toContain('"Recipe Box"');
    expect(fs.existsSync(path.join(targetDir, 'src/template.test.tsx'))).toBe(false);
  });

  it('layers forms and feedback features with resolved dependencies', () => {
    const targetDir = path.join(tmpDir, 'examples/full');
    generateApp({
      repoRoot: REPO_ROOT,
      targetDir,
      name: 'full',
      title: 'Full',
      port: 5712,
      features: ['forms', 'feedback'],
    });

    const deps = JSON.parse(read(path.join(targetDir, 'package.json'))).dependencies;
    expect(deps['@scaffold/core']).toBe('*');
    expect(deps['@scaffold/feedback']).toBe('*');
    expect(deps.zod).toBe(resolveDependencyVersion(REPO_ROOT, 'zod'));
    expect(deps['react-hook-form']).toBeTruthy();
    expect(deps['@hookform/resolvers']).toBeTruthy();
    expect(Object.keys(deps)).toEqual([...Object.keys(deps)].sort((a, b) => a.localeCompare(b)));

    expect(read(path.join(targetDir, 'src/routes/app/settings.tsx'))).toContain('useAppForm');
    expect(read(path.join(targetDir, 'src/routes/__root.tsx'))).toContain('FeedbackWidget');
    expect(fs.existsSync(path.join(targetDir, 'src/forms.test.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'src/feedback.test.tsx'))).toBe(true);
  });

  it.each(['cpSync', 'renameSync'])('cleans up and preserves errors from %s', (operation) => {
    const targetDir = path.join(tmpDir, 'examples/failed');
    const error = new Error('Generation failed');
    vi.spyOn(fs, operation).mockImplementationOnce(() => {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'partial.txt'), 'partial');
      throw error;
    });

    expect(() => generateApp({
      repoRoot: REPO_ROOT,
      targetDir,
      name: 'failed',
      title: 'Failed',
      port: 5710,
      features: [],
    })).toThrow(error);
    expect(fs.existsSync(targetDir)).toBe(false);
  });

  it('removes copied files when a template transform fails', () => {
    createFixtureRepo(tmpDir);
    fs.writeFileSync(path.join(tmpDir, 'apps/template/index.html'), '<title>Changed</title>');
    const targetDir = path.join(tmpDir, 'examples/failed');

    expect(() => generateApp({
      repoRoot: tmpDir,
      targetDir,
      name: 'failed',
      title: 'Failed',
      port: 5710,
      features: [],
    })).toThrow(/Template drift/);
    expect(fs.existsSync(targetDir)).toBe(false);
  });

  it('refuses to overwrite an existing directory', () => {
    const targetDir = path.join(tmpDir, 'examples/taken');
    fs.mkdirSync(targetDir, { recursive: true });
    expect(() =>
      generateApp({
        repoRoot: REPO_ROOT,
        targetDir,
        name: 'taken',
        title: 'Taken',
        port: 5713,
        features: [],
      }),
    ).toThrow(/already exists/);
    expect(fs.existsSync(targetDir)).toBe(true);
  });
});

describe('repo helpers', () => {
  it('skips ports claimed by workspace configs', async () => {
    createFixtureRepo(tmpDir);
    for (const [directory, port] of [['apps/a', 5710], ['examples/b', 5711]]) {
      fs.mkdirSync(path.join(tmpDir, directory), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, directory, 'vite.config.ts'),
        `export default { server: { port: ${port} } };`,
      );
    }
    expect(await findFreePort(tmpDir)).toBeGreaterThanOrEqual(5712);
  });

  it('skips a port bound by an OS process and releases its probe', async () => {
    const occupiedPort = await findFreePort(tmpDir);
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(occupiedPort, '127.0.0.1', resolve);
    });
    try {
      expect(await findFreePort(tmpDir)).toBeGreaterThan(occupiedPort);
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    expect(await findFreePort(tmpDir)).toBe(occupiedPort);
  });

  it('adds examples/* to workspaces once', () => {
    createFixtureRepo(tmpDir);
    expect(ensureExamplesWorkspace(tmpDir)).toBe(true);
    expect(ensureExamplesWorkspace(tmpDir)).toBe(false);
    expect(JSON.parse(read(path.join(tmpDir, 'package.json'))).workspaces).toEqual([
      'packages/*',
      'apps/*',
      'examples/*',
    ]);
  });
});

describe('main', () => {
  it('generates, updates workspaces, and registers with the dashboard', async () => {
    createFixtureRepo(tmpDir);
    const register = vi.fn(async () => ({ ok: true }));
    const logs = [];

    const code = await main(['new', 'recipe-box', '--with', 'forms'], {
      repoRoot: tmpDir,
      log: (message) => logs.push(message),
      register,
    });

    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, 'examples/recipe-box/package.json'))).toBe(true);
    expect(register).toHaveBeenCalledWith({
      name: 'Recipe Box',
      directory: path.join(tmpDir, 'examples/recipe-box'),
      port: expect.any(Number),
    });
    const { port } = register.mock.calls[0][0];
    expect(read(path.join(tmpDir, 'examples/recipe-box/vite.config.ts'))).toContain(`port: ${port}`);
    expect(logs.join('\n')).toContain('npm --workspace=recipe-box run dev');
  });

  it('skips registration with --no-register', async () => {
    createFixtureRepo(tmpDir);
    const register = vi.fn();
    await main(['new', 'quiet-app', '--no-register', '--port', '5800'], {
      repoRoot: tmpDir,
      log: () => undefined,
      register,
    });
    expect(register).not.toHaveBeenCalled();
    expect(read(path.join(tmpDir, 'examples/quiet-app/vite.config.ts'))).toContain('port: 5800');
  });
});

describe('registerWithDashboard', () => {
  it('uses the pulled protocol version when registering', async () => {
    const fetchImpl = vi.fn(async (url, init) => {
      if (String(url).endsWith('/api/agent-protocol')) {
        return new Response(JSON.stringify({ protocol: 2 }), { status: 200 });
      }
      return new Response(init?.body ?? '{}', { status: 200 });
    });

    const result = await registerWithDashboard({
      name: 'Recipe Box',
      directory: '/tmp/recipe-box',
      port: 5710,
      fetchImpl,
    });

    expect(result).toEqual({ ok: true });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toEqual({
      protocol: 2,
      name: 'Recipe Box',
      directory: '/tmp/recipe-box',
      port: 5710,
    });
  });

  it('reports failure instead of throwing when the dashboard is down', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('connect ECONNREFUSED');
    });
    const result = await registerWithDashboard({
      name: 'x',
      directory: '/tmp/x',
      port: 5710,
      fetchImpl,
    });
    expect(result).toEqual({ ok: false, reason: 'connect ECONNREFUSED' });
  });
});
