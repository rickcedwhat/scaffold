import fs from 'node:fs';
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
  });
});

describe('repo helpers', () => {
  it('picks the first unclaimed port from 5710', () => {
    createFixtureRepo(tmpDir);
    for (const [name, port] of [['a', 5710], ['b', 5711]]) {
      fs.mkdirSync(path.join(tmpDir, 'examples', name), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'examples', name, 'vite.config.ts'),
        `export default { server: { port: ${port} } };`,
      );
    }
    expect(findFreePort(tmpDir)).toBe(5712);
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
      port: 5710,
    });
    expect(logs.join('\n')).toContain('npm --workspace=recipe-box run dev');
  });

  it('skips registration with --no-register', async () => {
    createFixtureRepo(tmpDir);
    const register = vi.fn();
    await main(['new', 'quiet-app', '--no-register'], {
      repoRoot: tmpDir,
      log: () => undefined,
      register,
    });
    expect(register).not.toHaveBeenCalled();
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
