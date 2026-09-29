import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EnvValidationError, createClientEnv } from './index';

describe('createClientEnv', () => {
  it('returns only declared keys, parsed and typed', () => {
    const env = createClientEnv(
      z.object({
        VITE_API_URL: z.url(),
        VITE_ENABLE_TELEMETRY: z.stringbool().default(false),
      }),
      { VITE_API_URL: 'https://api.example.com', UNRELATED: 'ignored' },
    );

    expect(env).toEqual({ VITE_API_URL: 'https://api.example.com', VITE_ENABLE_TELEMETRY: false });
  });

  it('lists every invalid or missing variable', () => {
    const schema = z.object({ VITE_API_URL: z.url(), VITE_REGION: z.string() });

    try {
      createClientEnv(schema, { VITE_API_URL: 'not a url' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const { issues, message } = error as EnvValidationError;
      expect(issues).toHaveLength(2);
      expect(issues[0]).toMatch(/^VITE_API_URL:/);
      expect(issues[1]).toMatch(/^VITE_REGION:/);
      expect(message).toContain('.env.example');
    }
  });

  it('rejects keys Vite would not expose to the browser', () => {
    expect(() =>
      createClientEnv(z.object({ GEMINI_API_KEY: z.string() }), { GEMINI_API_KEY: 'secret' }),
    ).toThrow(/GEMINI_API_KEY: client env keys must start with VITE_/);
  });
});
