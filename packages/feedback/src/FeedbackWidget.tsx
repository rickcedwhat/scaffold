import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Fab, toast } from '@scaffold/ui';
import { MessageSquarePlus } from 'lucide-react';
import { IssueReportModal } from './IssueReportModal';
import { installConsoleCapture } from './diagnostics';
import { isIssueReportingEnabled } from './enabled';
import type { IssueAdapter, IssueReportResult, IssueReportingConfig } from './types';

export interface FeedbackWidgetProps extends IssueReportingConfig {
  /**
   * When true (default), installs a console.error capture for the widget lifetime.
   */
  captureConsole?: boolean;
  /** Override route pathname for diagnostics. */
  pathname?: string;
  /** Optional custom trigger. Defaults to a bottom-right Fab. Pass `null` to control open state externally only. */
  trigger?: ReactNode | null;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmitted?: (result: IssueReportResult) => void;
  /** Show a success toast after filing (default true). */
  toastOnSuccess?: boolean;
}

/**
 * Floating feedback entry point + IssueReportModal.
 * Renders nothing when reporting is disabled or no adapter is configured —
 * zero UI overhead when omitted from an app.
 */
export function FeedbackWidget({
  enabled,
  adapter,
  defaultLabels,
  extraDiagnostics,
  captureConsole = true,
  pathname,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSubmitted,
  toastOnSuccess = true,
}: FeedbackWidgetProps) {
  const active = isIssueReportingEnabled(enabled) && Boolean(adapter);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  useEffect(() => {
    if (!active || !captureConsole) return;
    return installConsoleCapture();
  }, [active, captureConsole]);

  const resolvedAdapter = useMemo(() => adapter as IssueAdapter | undefined, [adapter]);

  if (!active || !resolvedAdapter) {
    return null;
  }

  const handleSubmitted = (result: IssueReportResult) => {
    if (toastOnSuccess) {
      toast.success(
        result.url
          ? `Issue filed (${result.id})`
          : 'Issue filed successfully',
        result.url
          ? {
              description: 'Open the report in a new tab from the confirmation screen.',
            }
          : undefined,
      );
    }
    onSubmitted?.(result);
  };

  return (
    <>
      {trigger === null ? null : trigger ? (
        <span
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          {trigger}
        </span>
      ) : (
        <Fab
          label="Report an issue"
          intent="secondary"
          size="md"
          placement="bottom-right"
          icon={<MessageSquarePlus size={20} />}
          onClick={() => setOpen(true)}
        />
      )}

      <IssueReportModal
        open={open}
        onOpenChange={setOpen}
        enabled
        adapter={resolvedAdapter}
        defaultLabels={defaultLabels}
        extraDiagnostics={extraDiagnostics}
        pathname={pathname}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}
