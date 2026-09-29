import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

export const INFISICAL_API_URL = process.env.INFISICAL_API_URL ?? 'https://app.infisical.com/api';
export const INFISICAL_PROJECT_SLUG = process.env.SCAFFOLD_INFISICAL_PROJECT ?? 'projects';
export const SHARED_SECRETS_PATH = '/shared';
const ENVIRONMENT = 'dev';
const TIMEOUT_MS = 10_000;

/**
 * Returns the logged-in Infisical user's access token, or null when the CLI is
 * missing or logged out.
 *
 * @param {{ exec?: (file: string, args: string[]) => Promise<{ stdout: string }> }} [deps]
 */
export async function getInfisicalToken({ exec = promisify(execFile) } = {}) {
  try {
    const { stdout } = await exec('infisical', ['user', 'get', 'token', '--plain', '--silent']);
    const token = stdout.trim();
    return token || null;
  } catch {
    return null;
  }
}

function isAlreadyExists(body) {
  return /already exist/i.test(JSON.stringify(body));
}

/**
 * Creates `/<name>` in the shared Infisical project, imports `/shared` into it,
 * and writes `.infisical.json`. Never throws — Infisical being unavailable
 * should not fail app generation.
 *
 * @param {{
 *   name: string;
 *   targetDir: string;
 *   token: string;
 *   fetchImpl?: typeof fetch;
 *   apiUrl?: string;
 *   projectSlug?: string;
 * }} options
 * @returns {Promise<{ ok: true; projectId: string; secretPath: string } | { ok: false; reason: string }>}
 */
export async function linkInfisical({
  name,
  targetDir,
  token,
  fetchImpl = fetch,
  apiUrl = INFISICAL_API_URL,
  projectSlug = INFISICAL_PROJECT_SLUG,
}) {
  const request = async (method, route, body) => {
    const response = await fetchImpl(`${apiUrl}${route}`, {
      method,
      redirect: 'error',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, json };
  };

  try {
    const url = new URL(apiUrl);
    const isLoopback =
      url.hostname === 'localhost' ||
      url.hostname === '[::1]' ||
      /^127(?:\.\d{1,3}){3}$/.test(url.hostname);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
      return {
        ok: false,
        reason: 'Infisical API URL must use HTTPS (HTTP is allowed only for loopback hosts)',
      };
    }

    const projects = await request('GET', '/v1/workspace');
    if (!projects.ok) return { ok: false, reason: `listing projects failed (${projects.status})` };
    const project = projects.json.workspaces?.find((workspace) => workspace.slug === projectSlug);
    if (!project) {
      return { ok: false, reason: `no Infisical project with slug "${projectSlug}"` };
    }

    const secretPath = `/${name}`;
    const folder = await request('POST', '/v1/folders', {
      workspaceId: project.id,
      environment: ENVIRONMENT,
      name,
      path: '/',
    });
    if (!folder.ok && !isAlreadyExists(folder.json)) {
      return { ok: false, reason: `creating ${secretPath} failed (${folder.status})` };
    }

    const secretImport = await request('POST', '/v1/secret-imports', {
      workspaceId: project.id,
      environment: ENVIRONMENT,
      path: secretPath,
      import: { environment: ENVIRONMENT, path: SHARED_SECRETS_PATH },
    });
    if (!secretImport.ok && !isAlreadyExists(secretImport.json)) {
      return {
        ok: false,
        reason: `importing ${SHARED_SECRETS_PATH} into ${secretPath} failed (${secretImport.status})`,
      };
    }

    fs.writeFileSync(
      path.join(targetDir, '.infisical.json'),
      `${JSON.stringify(
        { workspaceId: project.id, defaultEnvironment: ENVIRONMENT, gitBranchToEnvironmentMapping: null },
        null,
        2,
      )}\n`,
      'utf-8',
    );
    return { ok: true, projectId: project.id, secretPath };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Points `npm run dev` at Infisical and keeps plain Vite as `dev:plain`.
 *
 * @param {string} targetDir
 * @param {string} secretPath
 */
export function useInfisicalDevScript(targetDir, secretPath) {
  const manifestPath = path.join(targetDir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  manifest.scripts.dev = `infisical run --path=${secretPath} --silent -- vite`;
  manifest.scripts['dev:plain'] = 'vite';
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}
