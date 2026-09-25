import type { IssueAdapter, IssueReportResult } from '../types';

/**
 * No-op adapter for disabled / test environments.
 * Resolves immediately without network I/O.
 */
export function createNoopIssueAdapter(
  result?: Partial<IssueReportResult>,
): IssueAdapter {
  return {
    name: 'noop',
    async submit() {
      return {
        id: result?.id ?? 'noop',
        url: result?.url ?? '',
        provider: result?.provider ?? 'noop',
      };
    },
  };
}
