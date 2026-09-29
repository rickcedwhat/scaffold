import { parseArgs } from 'node:util';
import { FEATURES } from './features.mjs';

export const USAGE = `Usage:
  scaffold new <name> [options]

Creates examples/<name> from apps/template inside this monorepo.

Options:
  --with <features>   Comma-separated opt-in features: ${Object.keys(FEATURES).join(', ')}
  --title <title>     Display title (default: derived from name)
  --port <port>       Dev server port (default: next free port from 5710)
  --no-register       Skip registering with the local dev dashboard
  --no-infisical      Skip creating the app's Infisical folder (dev uses plain Vite)
  -h, --help          Show this help

Example:
  npm run new -- recipe-box --with forms,feedback`;

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
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const [command, name] = positionals;
  if (values.help || !command || command === 'help') {
    return { command: 'help' };
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
