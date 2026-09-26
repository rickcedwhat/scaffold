import type { IssueAdapter, IssueReportPayload, IssueReportResult } from '../types';
import { formatDiagnosticsMarkdown } from '../diagnostics';

export interface LinearIssueAdapterOptions {
  /** Linear personal API key (prefer a backend proxy in production). */
  apiKey?: string;
  /** Team UUID required by Linear `issueCreate`. */
  teamId: string;
  /**
   * Backend proxy endpoint. When set, POSTs JSON instead of calling Linear GraphQL.
   */
  proxyUrl?: string;
  fetchImpl?: typeof fetch;
  /** Optional Linear GraphQL endpoint override. */
  apiUrl?: string;
}

const CREATE_ISSUE_MUTATION = `
  mutation CreateIssue($title: String!, $description: String!, $teamId: String!) {
    issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
      success
      issue {
        id
        identifier
        url
      }
    }
  }
`;

/**
 * Optional Linear adapter — GraphQL direct or backend proxy.
 */
export function createLinearIssueAdapter(
  options: LinearIssueAdapterOptions,
): IssueAdapter {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiUrl = options.apiUrl ?? 'https://api.linear.app/graphql';

  return {
    name: 'linear',
    async submit(payload: IssueReportPayload): Promise<IssueReportResult> {
      const description = [
        `**Kind:** ${payload.kind}`,
        '',
        payload.description.trim(),
        '',
        '---',
        '',
        formatDiagnosticsMarkdown(payload.diagnostics),
      ].join('\n');

      if (options.proxyUrl) {
        const response = await fetchImpl(options.proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(options.apiKey ? { Authorization: options.apiKey } : {}),
          },
          body: JSON.stringify({
            title: payload.title,
            description,
            kind: payload.kind,
            teamId: options.teamId,
            diagnostics: payload.diagnostics,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(
            `Linear proxy failed (${response.status}): ${text || response.statusText}`,
          );
        }

        const data = (await response.json()) as {
          id?: string;
          url?: string;
          identifier?: string;
        };

        return {
          id: data.identifier ?? data.id ?? 'unknown',
          url: data.url ?? options.proxyUrl,
          provider: 'linear',
        };
      }

      if (!options.apiKey) {
        throw new Error('Linear adapter requires `apiKey` when not using `proxyUrl`.');
      }

      const response = await fetchImpl(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: options.apiKey,
        },
        body: JSON.stringify({
          query: CREATE_ISSUE_MUTATION,
          variables: {
            title: payload.title,
            description,
            teamId: options.teamId,
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `Linear API failed (${response.status}): ${text || response.statusText}`,
        );
      }

      const json = (await response.json()) as {
        data?: {
          issueCreate?: {
            success?: boolean;
            issue?: { id: string; identifier: string; url: string };
          };
        };
        errors?: Array<{ message: string }>;
      };

      if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join('; '));
      }

      const issue = json.data?.issueCreate?.issue;
      if (!issue) {
        throw new Error('Linear issueCreate returned no issue.');
      }

      return {
        id: issue.identifier,
        url: issue.url,
        provider: 'linear',
      };
    },
  };
}
