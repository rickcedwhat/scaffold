import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  captureDiagnostics,
  clearCapturedConsoleErrors,
  formatDiagnosticsMarkdown,
  getCapturedConsoleErrors,
  installConsoleCapture,
  uninstallConsoleCapture,
} from './diagnostics';
import { isIssueReportingEnabled } from './enabled';
import { createGitHubIssueAdapter } from './adapters/github';
import { createLinearIssueAdapter } from './adapters/linear';
import { createNoopIssueAdapter } from './adapters/noop';
import type { IssueReportPayload } from './types';

function samplePayload(
  overrides: Partial<IssueReportPayload> = {},
): IssueReportPayload {
  return {
    title: 'Broken save button',
    description: 'Clicking Save does nothing on the settings page.',
    kind: 'bug',
    diagnostics: captureDiagnostics(),
    labels: ['feedback'],
    ...overrides,
  };
}

describe('diagnostics', () => {
  beforeEach(() => {
    clearCapturedConsoleErrors();
    uninstallConsoleCapture();
  });

  afterEach(() => {
    uninstallConsoleCapture();
    clearCapturedConsoleErrors();
  });

  it('captures viewport and route context', () => {
    const snap = captureDiagnostics({
      pathname: '/dashboard/settings',
      extras: { app: 'demo' },
    });

    expect(snap.pathname).toBe('/dashboard/settings');
    expect(snap.viewport.width).toBeGreaterThan(0);
    expect(snap.extras).toEqual({ app: 'demo' });
    expect(snap.capturedAt).toBeTruthy();
  });

  it('installs console capture and records errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    installConsoleCapture({ maxEntries: 5 });

    // Call through the installed wrapper
    console.error('boom', new Error('detail'));

    const errors = getCapturedConsoleErrors();
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors[0]?.message).toContain('boom');

    const md = formatDiagnosticsMarkdown(
      captureDiagnostics({ pathname: '/x' }),
    );
    expect(md).toContain('### Client diagnostics');
    expect(md).toContain('Recent console errors');

    spy.mockRestore();
  });
});

describe('isIssueReportingEnabled', () => {
  const original = process.env.ENABLE_ISSUE_REPORTING;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ENABLE_ISSUE_REPORTING;
    } else {
      process.env.ENABLE_ISSUE_REPORTING = original;
    }
  });

  it('honors explicit boolean override', () => {
    expect(isIssueReportingEnabled(true)).toBe(true);
    expect(isIssueReportingEnabled(false)).toBe(false);
  });

  it('reads ENABLE_ISSUE_REPORTING from process.env', () => {
    process.env.ENABLE_ISSUE_REPORTING = 'true';
    expect(isIssueReportingEnabled()).toBe(true);

    process.env.ENABLE_ISSUE_REPORTING = 'false';
    expect(isIssueReportingEnabled()).toBe(false);
  });
});

describe('adapters', () => {
  it('noop adapter resolves without network', async () => {
    const adapter = createNoopIssueAdapter({ id: '1', url: 'https://example.test/1' });
    const result = await adapter.submit(samplePayload());
    expect(result).toEqual({
      id: '1',
      url: 'https://example.test/1',
      provider: 'noop',
    });
  });

  it('github adapter posts to the Issues API', async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        new Response(
          JSON.stringify({
            id: 99,
            number: 42,
            html_url: 'https://github.com/acme/app/issues/42',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
    );

    const adapter = createGitHubIssueAdapter({
      repository: 'acme/app',
      token: 'test-token',
      fetchImpl,
      labels: ['scaffold'],
    });

    const result = await adapter.submit(samplePayload());
    expect(result.id).toBe('42');
    expect(result.url).toContain('/issues/42');
    expect(result.provider).toBe('github');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.github.com/repos/acme/app/issues');
    expect(init?.method).toBe('POST');
    const body = JSON.parse(String(init?.body));
    expect(body.title).toBe('Broken save button');
    expect(body.labels).toEqual(expect.arrayContaining(['scaffold', 'feedback', 'kind:bug']));
    expect(body.body).toContain('Client diagnostics');
  });

  it('github adapter can use a backend proxy', async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        new Response(
          JSON.stringify({ id: 'p1', html_url: 'https://proxy.test/issues/1' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    );

    const adapter = createGitHubIssueAdapter({
      proxyUrl: 'https://proxy.test/report',
      fetchImpl,
    });

    const result = await adapter.submit(samplePayload());
    expect(result.url).toBe('https://proxy.test/issues/1');
    expect(fetchImpl.mock.calls[0]![0]).toBe('https://proxy.test/report');
  });

  it('linear adapter posts GraphQL create mutation', async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        new Response(
          JSON.stringify({
            data: {
              issueCreate: {
                success: true,
                issue: {
                  id: 'uuid',
                  identifier: 'SCA-12',
                  url: 'https://linear.app/acme/issue/SCA-12',
                },
              },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
    );

    const adapter = createLinearIssueAdapter({
      apiKey: 'lin_key',
      teamId: 'team-1',
      fetchImpl,
    });

    const result = await adapter.submit(samplePayload({ kind: 'feedback' }));
    expect(result.id).toBe('SCA-12');
    expect(result.provider).toBe('linear');

    const body = JSON.parse(String(fetchImpl.mock.calls[0]![1]?.body));
    expect(body.variables.teamId).toBe('team-1');
    expect(body.query).toContain('issueCreate');
  });
});
