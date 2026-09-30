import { parseArgs } from 'node:util';
import { FEATURES } from './features.mjs';
import { RECIPES } from './recipes/index.mjs';
import { ENVIRONMENTS, validateSecretPath } from './secrets.mjs';

export const USAGE = `Usage:
  scaffold new <name> [options]
  scaffold secrets add <recipe> --app <folder> [--env <env>]

new: creates examples/<name> from apps/template inside this monorepo.
  --with <features>   Comma-separated opt-in features: ${Object.keys(FEATURES).join(', ')}
  --title <title>     Display title (default: derived from name)
  --port <port>       Dev server port (default: next free port from 5710)
  --no-register       Skip registering with the local dev dashboard
  --no-infisical      Skip creating the app's Infisical folder (dev uses plain Vite)

secrets add: creates a dedicated credential and stores it in Infisical at
/<folder>, overriding the shared one. Recipes: ${Object.keys(RECIPES).join(', ')}
  --app <folder>      Infisical folder, e.g. recipe-box or career-hub/evals
  --env <env>         ${ENVIRONMENTS.join(' | ')} (default: dev)

  -h, --help          Show this help

Examples:
  npm run new -- recipe-box --with forms,feedback
  npm run scaffold -- secrets add gemini --app recipe-box --env prod`;

const RESERVED_NAMES = new Set(['demo', 'template', 'workbench', 'examples']);

/**
 * @param {string} name
 * @returns {string | null} error message, or null when valid
 */
export function validateName(name) {
  if (!name) return 'An app name is required.';
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    return `"${name}" is not a valid name. Use lowercase kebab-case, e.g. "recipe-box".`;
  }
  if (RESERVED_NAMES.has(name) || name.startsWith('scaffold')) {
    return `"${name}" collides with an existing workspace name.`;
  }
  return null;
}

/**
 * @param {string} name
 */
export function titleFromName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * @typedef {{
 *   command: 'new';
 *   name: string;
 *   title: string;
 *   port?: number;
 *   features: string[];
 *   register: boolean;
 *   infisical: boolean;
 * } | {
 *   command: 'secrets-add';
 *   recipe: string;
 *   app: string;
 *   environment: string;
 * } | { command: 'help' }} ParsedArgs
 */

/**
 * @param {string[]} argv
 * @returns {ParsedArgs}
 */
export function parseCliArgs(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      with: { type: 'string' },
      title: { type: 'string' },
      port: { type: 'string' },
      'no-register': { type: 'boolean', default: false },
      'no-infisical': { type: 'boolean', default: false },
      app: { type: 'string' },
      env: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const [command, name] = positionals;
  if (values.help || !command || command === 'help') {
    return { command: 'help' };
  }
  if (command === 'secrets') {
    return parseSecretsArgs(positionals.slice(1), values);
  }
  if (command !== 'new') {
    throw new Error(`Unknown command "${command}".\n\n${USAGE}`);
  }

  const nameError = validateName(name ?? '');
  if (nameError) throw new Error(nameError);

  const features = (values.with ?? '')
    .split(',')
    .map((feature) => feature.trim())
    .filter(Boolean);
  const unknown = features.filter((feature) => !(feature in FEATURES));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown feature(s): ${unknown.join(', ')}. Available: ${Object.keys(FEATURES).join(', ')}.`,
    );
  }

  let port;
  if (values.port !== undefined) {
    port = Number(values.port);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      throw new Error(`--port must be an integer between 1024 and 65535.`);
    }
  }

  return {
    command: 'new',
    name,
    title: values.title?.trim() || titleFromName(name),
    port,
    features: [...new Set(features)],
    register: !values['no-register'],
    infisical: !values['no-infisical'],
  };
}

function parseSecretsArgs([subcommand, recipe], values) {
  if (subcommand !== 'add') {
    throw new Error(`Unknown secrets command "${subcommand ?? ''}".\n\n${USAGE}`);
  }
  if (!recipe || !(recipe in RECIPES)) {
    throw new Error(
      `Unknown recipe "${recipe ?? ''}". Available: ${Object.keys(RECIPES).join(', ')}.`,
    );
  }
  const app = values.app ?? '';
  const appError = validateSecretPath(app);
  if (appError) throw new Error(appError);

  const environment = values.env ?? 'dev';
  if (!ENVIRONMENTS.includes(environment)) {
    throw new Error(`--env must be one of: ${ENVIRONMENTS.join(', ')}.`);
  }
  return { command: 'secrets-add', recipe, app, environment };
}
