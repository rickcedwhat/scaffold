/**
 * Shared types for the Scaffold issue-reporting feedback surface.
 */

export type IssueReportKind = 'bug' | 'feedback' | 'question';

export interface ConsoleErrorEntry {
  message: string;
  timestamp: string;
  source?: string;
}

export interface ClientDiagnostics {
  userAgent: string;
  language: string;
  platform: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  url: string;
  pathname: string;
  timezone: string;
  capturedAt: string;
  consoleErrors: ConsoleErrorEntry[];
  extras?: Record<string, string | number | boolean | null>;
}

export interface IssueReportPayload {
  title: string;
  description: string;
  kind: IssueReportKind;
  diagnostics: ClientDiagnostics;
  labels?: string[];
}

export interface IssueReportResult {
  id: string;
  url: string;
  provider: string;
}

export interface IssueAdapter {
  readonly name: string;
  submit(payload: IssueReportPayload): Promise<IssueReportResult>;
}

export interface IssueReportingConfig {
  /**
   * Master switch. When false, widgets render nothing and adapters are unused.
   * Defaults to reading `VITE_ENABLE_ISSUE_REPORTING` / `ENABLE_ISSUE_REPORTING`.
   */
  enabled?: boolean;
  adapter?: IssueAdapter;
  /** Extra static labels appended to every submission. */
  defaultLabels?: string[];
  /** Extra diagnostics fields merged into every snapshot. */
  extraDiagnostics?: Record<string, string | number | boolean | null>;
}
