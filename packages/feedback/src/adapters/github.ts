import type { IssueAdapter, IssueReportPayload, IssueReportResult } from '../types';
import { formatDiagnosticsMarkdown } from '../diagnostics';

export interface GitHubIssueAdapterOptions {
  /** `owner/repo` — required unless `proxyUrl` is set and the proxy knows the repo. */
  repository?: string;
  /**
   * Fine-grained PAT with `issues: write`. Prefer a backend proxy in production —
   * browser-held tokens are only suitable for internal/dev tooling.
   */
  token?: string;
  /**
   * Backend proxy endpoint. When set, the adapter POSTs JSON
   * `{ title, body, labels, kind, diagnostics }` instead of calling GitHub directly.
   */
  proxyUrl?: string;
  /** Optional fetch implementation (tests / custom clients). */
  fetchImpl?: typeof fetch;
  /** Extra static labels always attached. */
  labels?: string[];
}

function buildIssueBody(payload: IssueReportPayload): string {
  const kindLabel = payload.kind.charAt(0).toUpperCase() + payload.kind.slice(1);
  return [
    `**Kind:** ${kindLabel}`,
    '',
    payload.description.trim(),
    '',
    '---',
    '',
    formatDiagnosticsMarkdown(payload.diagnostics),
  ].join('\n');
}

/**
 * GitHub Issues adapter — direct API or backend proxy.
 */
export function createGitHubIssueAdapter(
  options: GitHubIssueAdapterOptions,
): IssueAdapter {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    name: 'github',
    async submit(payload: IssueReportPayload): Promise<IssueReportResult> {
      const labels = [
        ...(options.labels ?? []),
        ...(payload.labels ?? []),
        `kind:${payload.kind}`,
      ];

      const body = buildIssueBody(payload);

      if (options.proxyUrl) {
        const response = await fetchImpl(options.proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          },
          body: JSON.stringify({
            title: payload.title,
            body,
            labels,
            kind: payload.kind,
            diagnostics: payload.diagnostics,
            repository: options.repository,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(
            `Issue proxy failed (${response.status}): ${text || response.statusText}`,
          );
        }

        const data = (await response.json()) as {
          id?: string | number;
          number?: number;
          url?: string;
          html_url?: string;
        };

        return {
          id: String(data.id ?? data.number ?? 'unknown'),
          url: data.html_url ?? data.url ?? options.proxyUrl,
          provider: 'github',
        };
      }

      if (!options.repository) {
        throw new Error('GitHub adapter requires `repository` (owner/repo) or `proxyUrl`.');
      }
      if (!options.token) {
        throw new Error('GitHub adapter requires `token` when not using `proxyUrl`.');
      }

      const response = await fetchImpl(
        `https://api.github.com/repos/${options.repository}/issues`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${options.token}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          body: JSON.stringify({
            title: payload.title,
            body,
            labels,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `GitHub Issues API failed (${response.status}): ${text || response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        id: number;
        number: number;
        html_url: string;
      };

      return {
        id: String(data.number),
        url: data.html_url,
        provider: 'github',
      };
    },
  };
}
