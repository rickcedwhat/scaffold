import { requireConfig } from '../config.mjs';

const GEMINI_SERVICE = 'generativelanguage.googleapis.com';

/** @type {import('./index.mjs').SecretRecipe} */
export const gemini = {
  id: 'gemini',
  label: 'Gemini API key',
  envVars: ['GEMINI_API_KEY'],

  async provision({ app, environment, config, exec }) {
    const gcpProject = requireConfig(config, 'recipes.gemini.gcpProject');
    const displayName = `${app} (${environment})`;

    const { stdout: listed } = await exec('gcloud', [
      'services',
      'api-keys',
      'list',
      `--project=${gcpProject}`,
      '--format=json(displayName,uid)',
    ]);
    if (JSON.parse(listed || '[]').some((key) => key.displayName === displayName)) {
      throw new Error(
        `A Gemini key named "${displayName}" already exists in ${gcpProject}. Delete it in Google Cloud first to replace it.`,
      );
    }

    const { stdout: created } = await exec('gcloud', [
      'services',
      'api-keys',
      'create',
      `--project=${gcpProject}`,
      `--display-name=${displayName}`,
      `--api-target=service=${GEMINI_SERVICE}`,
      '--format=json',
    ]);
    const { uid, keyString } = JSON.parse(created).response ?? {};
    if (!uid || !keyString) throw new Error('gcloud did not return the new key.');

    return {
      description: `Gemini key "${displayName}" in ${gcpProject}`,
      secrets: { GEMINI_API_KEY: keyString },
      rollback: async () => {
        await exec('gcloud', [
          'services',
          'api-keys',
          'delete',
          uid,
          `--project=${gcpProject}`,
          '--quiet',
        ]);
      },
    };
  },
};
