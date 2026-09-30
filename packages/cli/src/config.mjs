import fs from 'node:fs';
import path from 'node:path';

export const CONFIG_FILE = 'scaffold.config.json';

/**
 * @typedef {{
 *   infisical?: { projectId?: string };
 *   recipes?: Record<string, Record<string, string>>;
 * }} ScaffoldConfig
 */

/**
 * @param {string} repoRoot
 * @returns {ScaffoldConfig}
 */
export function loadConfig(repoRoot) {
  const file = path.join(repoRoot, CONFIG_FILE);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/**
 * @param {ScaffoldConfig} config
 * @param {string} key dotted path, e.g. "recipes.gemini.gcpProject"
 */
export function requireConfig(config, key) {
  const value = key.split('.').reduce((node, part) => node?.[part], config);
  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing "${key}" in ${CONFIG_FILE}.`);
  }
  return value;
}
