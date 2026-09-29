import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { requireConfig } from './config.mjs';

export const ENVIRONMENTS = ['dev', 'staging', 'prod'];

/** @type {import('./recipes/index.mjs').Exec} */
export const defaultExec = (file, args) =>
  promisify(execFile)(file, args, { maxBuffer: 10 * 1024 * 1024 });

/**
 * Infisical folder path segments, e.g. "recipe-box" or "career-hub/evals".
 *
 * @param {string} app
 * @returns {string | null} error message, or null when valid
 */
export function validateSecretPath(app) {
  if (!app) return '--app is required (the Infisical folder, e.g. "recipe-box").';
  if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(app)) {
    return `"${app}" is not a valid folder. Use kebab-case segments, e.g. "career-hub/evals".`;
  }
  return null;
}

function stderrOf(error) {
  return `${error?.stderr ?? ''}${error?.message ?? ''}`;
}

/**
 * Creates each folder segment of `/<app>` in the given environment, ignoring
 * segments that already exist.
 */
async function ensureFolders({ app, environment, projectId, exec }) {
  let parent = '/';
  for (const segment of app.split('/')) {
    try {
      await exec('infisical', [
        'secrets',
        'folders',
        'create',
        `--name=${segment}`,
        `--path=${parent}`,
        `--env=${environment}`,
        `--projectId=${projectId}`,
        '--silent',
      ]);
    } catch (error) {
      if (!/already exist/i.test(stderrOf(error))) throw error;
    }
    parent = parent === '/' ? `/${segment}` : `${parent}/${segment}`;
  }
}

/**
 * Writes secrets through a 0600 temp file so values never appear in argv.
 */
async function writeSecrets({ secrets, secretPath, environment, projectId, exec }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-secrets-'));
  const file = path.join(dir, 'secrets.env');
  try {
    const body = Object.entries(secrets)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(file, `${body}\n`, { mode: 0o600 });
    await exec('infisical', [
      'secrets',
      'set',
      `--file=${file}`,
      `--path=${secretPath}`,
      `--env=${environment}`,
      `--projectId=${projectId}`,
      '--silent',
    ]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Provisions a dedicated secret with a recipe and stores it in the app's
 * Infisical folder, where it overrides anything imported from /shared.
 * Rolls back the provider-side credential if storing it fails.
 *
 * @param {{
 *   recipe: import('./recipes/index.mjs').SecretRecipe;
 *   app: string;
 *   environment: string;
 *   config: import('./config.mjs').ScaffoldConfig;
 *   exec?: import('./recipes/index.mjs').Exec;
 * }} options
 */
export async function addSecretRecipe({ recipe, app, environment, config, exec = defaultExec }) {
  const projectId = requireConfig(config, 'infisical.projectId');
  const secretPath = `/${app}`;

  await ensureFolders({ app, environment, projectId, exec });
  const provisioned = await recipe.provision({ app, environment, config, exec });

  try {
    await writeSecrets({ secrets: provisioned.secrets, secretPath, environment, projectId, exec });
  } catch (error) {
    try {
      await provisioned.rollback();
    } catch (rollbackError) {
      throw new Error(
        `Storing secrets failed (${stderrOf(error)}) and ${provisioned.description} could not be removed.`,
        { cause: rollbackError },
      );
    }
    throw error;
  }

  return {
    description: provisioned.description,
    secretPath,
    environment,
    envVars: Object.keys(provisioned.secrets),
  };
}
