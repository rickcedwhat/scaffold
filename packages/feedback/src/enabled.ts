/**
 * Resolves whether issue reporting should be active.
 *
 * Checks (in order):
 * 1. Explicit `enabled` override
 * 2. `import.meta.env.VITE_ENABLE_ISSUE_REPORTING`
 * 3. `process.env.ENABLE_ISSUE_REPORTING` / `VITE_ENABLE_ISSUE_REPORTING`
 *
 * Absent / `"false"` / `"0"` → disabled (zero UI overhead when omitted).
 */
export function isIssueReportingEnabled(explicit?: boolean): boolean {
  if (typeof explicit === 'boolean') return explicit;

  const fromVite = readEnv('VITE_ENABLE_ISSUE_REPORTING');
  if (fromVite !== undefined) return parseFlag(fromVite);

  const fromProcess = readEnv('ENABLE_ISSUE_REPORTING');
  if (fromProcess !== undefined) return parseFlag(fromProcess);

  return false;
}

function parseFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function readEnv(key: string): string | undefined {
  try {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const viteValue = meta.env?.[key];
    if (typeof viteValue === 'string') return viteValue;
  } catch {
    // ignore non-Vite environments
  }

  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (typeof value === 'string') return value;
  }

  return undefined;
}
