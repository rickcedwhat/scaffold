import type { ClientDiagnostics, ConsoleErrorEntry } from './types';

const MAX_CAPTURED_ERRORS = 25;

let capturedErrors: ConsoleErrorEntry[] = [];
let captureInstalled = false;
let originalConsoleError: typeof console.error | null = null;

/**
 * Installs a lightweight console.error interceptor.
 * Safe to call multiple times; only the first install sticks.
 */
export function installConsoleCapture(options?: { maxEntries?: number }): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if (captureInstalled) {
    return uninstallConsoleCapture;
  }

  const max = options?.maxEntries ?? MAX_CAPTURED_ERRORS;
  originalConsoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.stack || arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

    capturedErrors = [
      {
        message: message.slice(0, 2000),
        timestamp: new Date().toISOString(),
        source: 'console.error',
      },
      ...capturedErrors,
    ].slice(0, max);

    originalConsoleError?.(...args);
  };

  captureInstalled = true;
  return uninstallConsoleCapture;
}

export function uninstallConsoleCapture(): void {
  if (!captureInstalled || !originalConsoleError) return;
  console.error = originalConsoleError;
  originalConsoleError = null;
  captureInstalled = false;
}

export function getCapturedConsoleErrors(): ConsoleErrorEntry[] {
  return [...capturedErrors];
}

export function clearCapturedConsoleErrors(): void {
  capturedErrors = [];
}

export interface CaptureDiagnosticsOptions {
  extras?: Record<string, string | number | boolean | null>;
  /** Override pathname/url (useful when router location is known). */
  pathname?: string;
  url?: string;
}

/**
 * Snapshot of browser/client context for issue reports.
 * Returns a minimal stub when called outside a browser environment.
 */
export function captureDiagnostics(
  options: CaptureDiagnosticsOptions = {},
): ClientDiagnostics {
  const now = new Date().toISOString();

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: 'ssr',
      language: 'und',
      platform: 'ssr',
      viewport: { width: 0, height: 0 },
      screen: { width: 0, height: 0 },
      url: options.url ?? '',
      pathname: options.pathname ?? '',
      timezone: 'UTC',
      capturedAt: now,
      consoleErrors: getCapturedConsoleErrors(),
      extras: options.extras,
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen?.width ?? 0,
      height: window.screen?.height ?? 0,
    },
    url: options.url ?? window.location.href,
    pathname: options.pathname ?? window.location.pathname,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    capturedAt: now,
    consoleErrors: getCapturedConsoleErrors(),
    extras: options.extras,
  };
}

/**
 * Formats diagnostics into a markdown block suitable for issue bodies.
 */
export function formatDiagnosticsMarkdown(diagnostics: ClientDiagnostics): string {
  const lines = [
    '### Client diagnostics',
    '',
    `- **URL:** ${diagnostics.url}`,
    `- **Path:** ${diagnostics.pathname}`,
    `- **Viewport:** ${diagnostics.viewport.width}×${diagnostics.viewport.height}`,
    `- **Screen:** ${diagnostics.screen.width}×${diagnostics.screen.height}`,
    `- **Timezone:** ${diagnostics.timezone}`,
    `- **Language:** ${diagnostics.language}`,
    `- **Platform:** ${diagnostics.platform}`,
    `- **Captured:** ${diagnostics.capturedAt}`,
    `- **User-Agent:** ${diagnostics.userAgent}`,
  ];

  if (diagnostics.extras && Object.keys(diagnostics.extras).length > 0) {
    lines.push('', '#### Extras');
    for (const [key, value] of Object.entries(diagnostics.extras)) {
      lines.push(`- **${key}:** ${String(value)}`);
    }
  }

  if (diagnostics.consoleErrors.length > 0) {
    lines.push('', '#### Recent console errors');
    lines.push('```');
    for (const entry of diagnostics.consoleErrors.slice(0, 10)) {
      lines.push(`[${entry.timestamp}] ${entry.message}`);
    }
    lines.push('```');
  }

  return lines.join('\n');
}
