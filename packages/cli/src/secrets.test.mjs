import fs from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { parseCliArgs } from './args.mjs';
import { main } from './main.mjs';
import { gemini } from './recipes/gemini.mjs';
import { addSecretRecipe, validateSecretPath } from './secrets.mjs';

const config = {
  infisical: { projectId: 'inf-proj' },
  recipes: { gemini: { gcpProject: 'gcp-proj' } },
};

/**
 * Fake `gcloud`/`infisical` runner. Captures the secrets file contents at call
 * time because the real file is deleted right after.
 */
function fakeExec({ existingKeys = [], failSet = false, folderExists = false } = {}) {
  const calls = [];
  const exec = vi.fn(async (file, args) => {
    const subcommand = args.slice(0, args.findIndex((arg) => arg.startsWith('--')));
    const command = [file, ...subcommand.slice(0, 3)].join(' ');
    const call = { command, args };
    calls.push(call);

    if (command === 'gcloud services api-keys list') {
      return { stdout: JSON.stringify(existingKeys) };
    }
    if (command === 'gcloud services api-keys create') {
      return { stdout: JSON.stringify({ response: { uid: 'key-uid', keyString: 'AIza-secret' } }) };
    }
    if (command === 'infisical secrets folders create' && folderExists) {
      throw Object.assign(new Error('exit 1'), { stderr: 'Folder already exists' });
    }
    if (command === 'infisical secrets set') {
      const fileArg = args.find((arg) => arg.startsWith('--file='));
      const secretsFile = fileArg.slice('--file='.length);
      call.fileContents = fs.readFileSync(secretsFile, 'utf-8');
      call.fileMode = fs.statSync(secretsFile).mode & 0o777;
      call.secretsFile = secretsFile;
      if (failSet) throw new Error('infisical: unauthorized');
    }
    return { stdout: '' };
  });
  return { exec, calls };
}

describe('secrets args', () => {
  it('parses secrets add with folder and environment', () => {
    expect(parseCliArgs(['secrets', 'add', 'gemini', '--app', 'career-hub/evals', '--env', 'prod']))
      .toEqual({ command: 'secrets-add', recipe: 'gemini', app: 'career-hub/evals', environment: 'prod' });
    expect(parseCliArgs(['secrets', 'add', 'gemini', '--app', 'recipe-box'])).toMatchObject({
      environment: 'dev',
    });
  });

  it('rejects unknown recipes, bad folders, and bad environments', () => {
    expect(() => parseCliArgs(['secrets', 'add', 'openai', '--app', 'x'])).toThrow(/Unknown recipe/);
    expect(() => parseCliArgs(['secrets', 'add', 'gemini'])).toThrow(/--app is required/);
    expect(() => parseCliArgs(['secrets', 'add', 'gemini', '--app', '../etc'])).toThrow(/not a valid folder/);
    expect(() => parseCliArgs(['secrets', 'add', 'gemini', '--app', 'x', '--env', 'qa'])).toThrow(/--env/);
    expect(() => parseCliArgs(['secrets', 'rotate', 'gemini'])).toThrow(/Unknown secrets command/);
    expect(validateSecretPath('Career-Hub')).toMatch(/not a valid folder/);
  });
});

describe('addSecretRecipe with gemini', () => {
  it('creates a restricted key and stores it in the app folder without exposing it in argv', async () => {
    const { exec, calls } = fakeExec();

    const result = await addSecretRecipe({
      recipe: gemini,
      app: 'career-hub/evals',
      environment: 'prod',
      config,
      exec,
    });

    expect(result).toEqual({
      description: 'Gemini key "career-hub/evals (prod)" in gcp-proj',
      secretPath: '/career-hub/evals',
      environment: 'prod',
      envVars: ['GEMINI_API_KEY'],
    });
    expect(calls.map((call) => call.command)).toEqual([
      'infisical secrets folders create',
      'infisical secrets folders create',
      'gcloud services api-keys list',
      'gcloud services api-keys create',
      'infisical secrets set',
    ]);
    expect(calls[0].args).toEqual(expect.arrayContaining(['--name=career-hub', '--path=/', '--env=prod']));
    expect(calls[1].args).toEqual(expect.arrayContaining(['--name=evals', '--path=/career-hub']));
    expect(calls[3].args).toEqual(
      expect.arrayContaining([
        '--project=gcp-proj',
        '--display-name=career-hub/evals (prod)',
        '--api-target=service=generativelanguage.googleapis.com',
      ]),
    );

    const setCall = calls[4];
    expect(setCall.args).toEqual(
      expect.arrayContaining(['--path=/career-hub/evals', '--env=prod', '--projectId=inf-proj']),
    );
    expect(setCall.fileContents).toBe('GEMINI_API_KEY=AIza-secret\n');
    expect(setCall.fileMode).toBe(0o600);
    expect(fs.existsSync(setCall.secretsFile)).toBe(false);
    expect(calls.flatMap((call) => call.args).join(' ')).not.toContain('AIza-secret');
  });

  it('tolerates existing folders', async () => {
    const { exec } = fakeExec({ folderExists: true });
    await expect(
      addSecretRecipe({ recipe: gemini, app: 'recipe-box', environment: 'dev', config, exec }),
    ).resolves.toMatchObject({ secretPath: '/recipe-box' });
  });

  it('refuses to create a second key with the same name', async () => {
    const { exec, calls } = fakeExec({
      existingKeys: [{ displayName: 'recipe-box (dev)', uid: 'old' }],
    });
    await expect(
      addSecretRecipe({ recipe: gemini, app: 'recipe-box', environment: 'dev', config, exec }),
    ).rejects.toThrow(/already exists/);
    expect(calls.some((call) => call.command === 'gcloud services api-keys create')).toBe(false);
  });

  it('deletes the new key when storing it in Infisical fails', async () => {
    const { exec, calls } = fakeExec({ failSet: true });
    await expect(
      addSecretRecipe({ recipe: gemini, app: 'recipe-box', environment: 'dev', config, exec }),
    ).rejects.toThrow(/unauthorized/);
    const deleteCall = calls.find((call) => call.command === 'gcloud services api-keys delete');
    expect(deleteCall.args).toEqual(expect.arrayContaining(['key-uid', '--project=gcp-proj']));
  });

  it('requires the Infisical project and GCP project in config', async () => {
    const { exec } = fakeExec();
    await expect(
      addSecretRecipe({ recipe: gemini, app: 'x', environment: 'dev', config: {}, exec }),
    ).rejects.toThrow(/infisical.projectId/);
    await expect(
      addSecretRecipe({
        recipe: gemini,
        app: 'x',
        environment: 'dev',
        config: { infisical: { projectId: 'p' } },
        exec,
      }),
    ).rejects.toThrow(/recipes.gemini.gcpProject/);
  });
});

describe('main secrets add', () => {
  it('reads scaffold.config.json from the repo root and reports the result', async () => {
    const repoRoot = fs.mkdtempSync(`${process.env.TMPDIR ?? '/tmp'}/scaffold-secrets-`);
    fs.writeFileSync(`${repoRoot}/scaffold.config.json`, JSON.stringify(config));
    const { exec } = fakeExec();
    const logs = [];

    try {
      const code = await main(['secrets', 'add', 'gemini', '--app', 'recipe-box'], {
        repoRoot,
        log: (message) => logs.push(message),
        exec,
      });
      expect(code).toBe(0);
      expect(logs.join('\n')).toBe(
        'Created Gemini key "recipe-box (dev)" in gcp-proj and stored GEMINI_API_KEY in /recipe-box (dev). It overrides the shared value.',
      );
    } finally {
      fs.rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});
