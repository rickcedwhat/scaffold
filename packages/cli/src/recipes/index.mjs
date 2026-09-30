import { gemini } from './gemini.mjs';

/**
 * @typedef {(file: string, args: string[]) => Promise<{ stdout: string; stderr?: string }>} Exec
 *
 * @typedef {{
 *   description: string;
 *   secrets: Record<string, string>;
 *   rollback: () => Promise<void>;
 * }} ProvisionedSecrets
 *
 * @typedef {{
 *   id: string;
 *   label: string;
 *   envVars: string[];
 *   provision: (options: {
 *     app: string;
 *     environment: string;
 *     config: import('../config.mjs').ScaffoldConfig;
 *     exec: Exec;
 *   }) => Promise<ProvisionedSecrets>;
 * }} SecretRecipe
 */

/** @type {Record<string, SecretRecipe>} */
export const RECIPES = { gemini };
