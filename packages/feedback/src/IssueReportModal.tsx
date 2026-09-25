import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Stack,
  Text,
  TextInput,
  Textarea,
  Dropdown,
  FormField,
  Badge,
} from '@scaffold/ui';
import { createFormSchema, useAppForm, z } from '@scaffold/core/form';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { captureDiagnostics } from './diagnostics';
import { isIssueReportingEnabled } from './enabled';
import type {
  IssueAdapter,
  IssueReportKind,
  IssueReportResult,
  IssueReportingConfig,
} from './types';

const reportSchema = createFormSchema({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Please provide a bit more detail (10+ characters).'),
  kind: z.enum(['bug', 'feedback', 'question']),
});

type ReportValues = z.infer<typeof reportSchema>;

export interface IssueReportModalProps extends IssueReportingConfig {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful submission. */
  onSubmitted?: (result: IssueReportResult) => void;
  /** Override pathname used in diagnostics (e.g. from TanStack Router). */
  pathname?: string;
}

/**
 * Opt-in modal for filing issues from a running app.
 * Renders nothing when disabled or when no adapter is provided.
 */
export function IssueReportModal({
  open,
  onOpenChange,
  enabled,
  adapter,
  defaultLabels,
  extraDiagnostics,
  onSubmitted,
  pathname,
}: IssueReportModalProps) {
  const active = isIssueReportingEnabled(enabled) && Boolean(adapter);

  if (!active || !adapter) {
    return null;
  }

  return (
    <IssueReportModalInner
      open={open}
      onOpenChange={onOpenChange}
      adapter={adapter}
      defaultLabels={defaultLabels}
      extraDiagnostics={extraDiagnostics}
      onSubmitted={onSubmitted}
      pathname={pathname}
    />
  );
}

interface InnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adapter: IssueAdapter;
  defaultLabels?: string[];
  extraDiagnostics?: Record<string, string | number | boolean | null>;
  onSubmitted?: (result: IssueReportResult) => void;
  pathname?: string;
}

function IssueReportModalInner({
  open,
  onOpenChange,
  adapter,
  defaultLabels,
  extraDiagnostics,
  onSubmitted,
  pathname,
}: InnerProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<IssueReportResult | null>(null);

  const form = useAppForm({
    schema: reportSchema,
    defaultValues: {
      title: '',
      description: '',
      kind: 'feedback' as IssueReportKind,
    },
  });

  const {
    register,
    handleAppSubmit,
    fieldError,
    fieldProps,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const kind = watch('kind');
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    setResult(null);
    formRef.current.reset();
  }, [open]);

  const diagnosticsPreview = useMemo(() => {
    if (!open) return null;
    return captureDiagnostics({
      pathname,
      extras: extraDiagnostics,
    });
  }, [open, pathname, extraDiagnostics]);

  const onValid = async (values: ReportValues) => {
    setSubmitError(null);
    try {
      const diagnostics = captureDiagnostics({
        pathname,
        extras: extraDiagnostics,
      });

      const submitted = await adapter.submit({
        title: values.title.trim(),
        description: values.description.trim(),
        kind: values.kind,
        diagnostics,
        labels: defaultLabels,
      });

      setResult(submitted);
      onSubmitted?.(submitted);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit issue report.';
      setSubmitError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" aria-describedby="issue-report-description">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription id="issue-report-description">
            Describe what happened. Client diagnostics are attached automatically.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <Stack gap={4}>
            <Stack direction="row" gap={2} align="center">
              <CheckCircle2 size={18} aria-hidden />
              <Text weight="medium">Thanks — your report was filed.</Text>
            </Stack>
            <Badge intent="success" size="sm">
              {adapter.name}: {result.id}
            </Badge>
            {result.url ? (
              <Text size="sm">
                <a href={result.url} target="_blank" rel="noreferrer">
                  View issue
                </a>
              </Text>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="solid"
                intent="primary"
                size="md"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </Stack>
        ) : (
          <form onSubmit={handleAppSubmit(onValid)} noValidate>
            <Stack gap={4}>
              <Dropdown
                label="Type"
                value={kind}
                onChange={(e) => {
                  setValue('kind', e.target.value as IssueReportKind, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                options={[
                  { value: 'bug', label: 'Bug' },
                  { value: 'feedback', label: 'Feedback' },
                  { value: 'question', label: 'Question' },
                ]}
                fullWidth
              />

              <FormField label="Title" required errorMessage={fieldError('title')}>
                {(a11y) => (
                  <TextInput
                    {...register('title')}
                    id={a11y.id}
                    required={a11y.required}
                    aria-describedby={a11y['aria-describedby']}
                    error={fieldProps('title').hasError}
                    placeholder="Short summary"
                    fullWidth
                  />
                )}
              </FormField>

              <FormField
                label="Description"
                required
                errorMessage={fieldError('description')}
                helperText={
                  fieldError('description')
                    ? undefined
                    : 'Steps to reproduce, expected vs actual, or general notes.'
                }
              >
                {(a11y) => (
                  <Textarea
                    {...register('description')}
                    id={a11y.id}
                    required={a11y.required}
                    aria-describedby={a11y['aria-describedby']}
                    hasError={fieldProps('description').hasError}
                    rows={5}
                    placeholder="What went wrong or what would you like to see?"
                    fullWidth
                  />
                )}
              </FormField>

              {diagnosticsPreview && (
                <Stack gap={1}>
                  <Text size="xs" color="secondary">
                    Attached diagnostics: {diagnosticsPreview.pathname || '/'} ·{' '}
                    {diagnosticsPreview.viewport.width}×{diagnosticsPreview.viewport.height} ·{' '}
                    {diagnosticsPreview.consoleErrors.length} console error
                    {diagnosticsPreview.consoleErrors.length === 1 ? '' : 's'}
                  </Text>
                </Stack>
              )}

              {submitError && (
                <Stack direction="row" gap={2} align="center">
                  <AlertCircle size={16} aria-hidden />
                  <Text size="sm" color="danger" role="alert">
                    {submitError}
                  </Text>
                </Stack>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  intent="neutral"
                  size="md"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  intent="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  <Stack direction="row" gap={2} align="center">
                    {isSubmitting ? <Loader2 size={16} aria-hidden /> : null}
                    <span>{isSubmitting ? 'Submitting…' : 'Submit report'}</span>
                  </Stack>
                </Button>
              </DialogFooter>
            </Stack>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
