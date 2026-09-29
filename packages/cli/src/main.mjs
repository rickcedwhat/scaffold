import path from 'node:path';
import { USAGE, parseCliArgs } from './args.mjs';
import { REPO_ROOT, ensureExamplesWorkspace, findFreePort, generateApp } from './generate.mjs';
import { getInfisicalToken, linkInfisical, useInfisicalDevScript } from './infisical.mjs';
import { registerWithDashboard } from './register.mjs';

/**
 * @param {string[]} argv
 * @param {{
 *   repoRoot?: string;
 *   log?: (message: string) => void;
 *   register?: typeof registerWithDashboard;
 *   getToken?: typeof getInfisicalToken;
 *   linkSecrets?: typeof linkInfisical;
 * }} [deps]
 * @returns {Promise<number>} process exit code
 */
export async function main(argv, deps = {}) {
  const repoRoot = deps.repoRoot ?? REPO_ROOT;
  const log = deps.log ?? console.log;
  const register = deps.register ?? registerWithDashboard;
  const getToken = deps.getToken ?? getInfisicalToken;
  const linkSecrets = deps.linkSecrets ?? linkInfisical;

  const args = parseCliArgs(argv);
  if (args.command === 'help') {
    log(USAGE);
    return 0;
  }

  const targetDir = path.join(repoRoot, 'examples', args.name);
  const port = args.port ?? await findFreePort(repoRoot);

  generateApp({
    repoRoot,
    targetDir,
    name: args.name,
    title: args.title,
    port,
    features: args.features,
  });
  const addedWorkspace = ensureExamplesWorkspace(repoRoot);

  log(`Created examples/${args.name} (port ${port})`);
  if (args.features.length > 0) log(`Features: ${args.features.join(', ')}`);
  if (addedWorkspace) log('Added "examples/*" to root workspaces.');

  if (args.infisical) {
    const token = await getToken();
    const result = token
      ? await linkSecrets({ name: args.name, targetDir, token })
      : { ok: false, reason: 'Infisical CLI not installed or not logged in (run `infisical login`)' };
    if (result.ok) {
      useInfisicalDevScript(targetDir, result.secretPath);
      log(`Linked Infisical folder ${result.secretPath} (imports shared secrets).`);
    } else {
      log(`Skipped Infisical setup: ${result.reason}. \`npm run dev\` uses plain Vite.`);
    }
  }

  if (args.register) {
    const result = await register({ name: args.title, directory: targetDir, port });
    log(
      result.ok
        ? `Registered "${args.title}" with the local dev dashboard.`
        : `Skipped dashboard registration: ${result.reason}`,
    );
  }

  log(
    [
      '',
      'Next steps:',
      '  npm install',
      `  npm --workspace=${args.name} run dev`,
      `  npm --workspace=${args.name} run test`,
    ].join('\n'),
  );
  return 0;
}
