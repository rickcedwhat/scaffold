const DASHBOARD_URL = 'http://localhost:4000';
const TIMEOUT_MS = 3000;

/**
 * Registers an app with the local dev dashboard. Never throws — a missing
 * dashboard should not fail app generation.
 *
 * @param {{ name: string; directory: string; port: number; fetchImpl?: typeof fetch; baseUrl?: string }} options
 * @returns {Promise<{ ok: true } | { ok: false; reason: string }>}
 */
export async function registerWithDashboard({
  name,
  directory,
  port,
  fetchImpl = fetch,
  baseUrl = DASHBOARD_URL,
}) {
  try {
    const protocolResponse = await fetchImpl(`${baseUrl}/api/agent-protocol`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!protocolResponse.ok) {
      return { ok: false, reason: `protocol request failed (${protocolResponse.status})` };
    }
    const { protocol } = await protocolResponse.json();

    const response = await fetchImpl(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol, name, directory, port }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { ok: false, reason: `register failed (${response.status}) ${text}`.trim() };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
