import type { z } from 'zod';

export const CLIENT_ENV_PREFIX = 'VITE_';

export class EnvValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(
      [
        'Invalid environment variables:',
        ...issues.map((issue) => `  - ${issue}`),
        'Run `npm run dev` to load secrets from Infisical, or copy .env.example to .env.local.',
      ].join('\n'),
    );
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

/**
 * Validates browser-exposed env vars (usually `import.meta.env`) against a Zod
 * object schema and returns only the declared keys, typed.
 *
 * Every key must use the `VITE_` prefix: Vite only exposes those to the client,
 * and anything it exposes ships in the bundle, so secrets never belong here.
 */
export function createClientEnv<Schema extends z.ZodObject>(
  schema: Schema,
  source: Record<string, unknown>,
): z.output<Schema> {
  const unprefixed = Object.keys(schema.shape).filter((key) => !key.startsWith(CLIENT_ENV_PREFIX));
  if (unprefixed.length > 0) {
    throw new EnvValidationError(
      unprefixed.map(
        (key) =>
          `${key}: client env keys must start with ${CLIENT_ENV_PREFIX}. Keep secrets server-side.`,
      ),
    );
  }

  const declared = Object.fromEntries(Object.keys(schema.shape).map((key) => [key, source[key]]));
  const result = schema.safeParse(declared);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    );
  }
  return result.data;
}
