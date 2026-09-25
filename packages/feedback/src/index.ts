export type {
  IssueReportKind,
  ConsoleErrorEntry,
  ClientDiagnostics,
  IssueReportPayload,
  IssueReportResult,
  IssueAdapter,
  IssueReportingConfig,
} from './types';

export {
  captureDiagnostics,
  formatDiagnosticsMarkdown,
  installConsoleCapture,
  uninstallConsoleCapture,
  getCapturedConsoleErrors,
  clearCapturedConsoleErrors,
  type CaptureDiagnosticsOptions,
} from './diagnostics';

export { isIssueReportingEnabled } from './enabled';

export {
  createGitHubIssueAdapter,
  createLinearIssueAdapter,
  createNoopIssueAdapter,
  type GitHubIssueAdapterOptions,
  type LinearIssueAdapterOptions,
} from './adapters';

export { IssueReportModal, type IssueReportModalProps } from './IssueReportModal';
export { FeedbackWidget, type FeedbackWidgetProps } from './FeedbackWidget';
