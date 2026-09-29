import { createClientEnv } from '@scaffold/core/env';
import { z } from 'zod';

// Everything declared here ships in the browser bundle. Secrets (API keys,
// tokens) stay server-side and must never be added to this schema.
const clientEnvSchema = z.object({});

export const env = createClientEnv(clientEnvSchema, import.meta.env);
