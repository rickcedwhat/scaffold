import { useMemo, useState } from 'react';
import {
  Stack,
  Heading,
  Text,
  Card,
  Button,
  Badge,
} from '@scaffold/ui';
import {
  FeedbackWidget,
  IssueReportModal,
  createNoopIssueAdapter,
  createGitHubIssueAdapter,
  isIssueReportingEnabled,
} from '@scaffold/feedback';

/**
 * Live showcase for `@scaffold/feedback` — IssueReportModal + adapters.
 */
export function FeedbackDemo() {
  const [open, setOpen] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const adapter = useMemo(
    () =>
      createNoopIssueAdapter({
        id: 'wb-42',
        url: 'https://github.com/rickcedwhat/scaffold/issues/42',
      }),
    [],
  );

  // Illustrates how a production adapter would be constructed (not used live —
  // no token in the workbench). Exists so the API stays discoverable here.
  void createGitHubIssueAdapter;

  return (
    <Stack gap={6}>
      <div>
        <Heading level={3} size="lg">
          Feedback / Issue Reporting
        </Heading>
        <Text size="sm" color="secondary">
          Opt-in `IssueReportModal` with GitHub (default) and Linear adapters.
          Disabled builds render nothing — zero UI overhead.
        </Text>
      </div>

      <Card padding="normal">
        <Stack gap={4}>
          <Stack direction="row" gap={2} align="center">
            <Text size="sm" weight="medium">
              Reporting enabled (explicit):
            </Text>
            <Badge intent="success" size="sm">
              {String(isIssueReportingEnabled(true))}
            </Badge>
            <Text size="sm" weight="medium">
              Env default:
            </Text>
            <Badge intent="neutral" size="sm">
              {String(isIssueReportingEnabled())}
            </Badge>
          </Stack>

          <Text size="sm" color="secondary">
            Demo adapter: <code>createNoopIssueAdapter</code>. Production apps
            typically use <code>createGitHubIssueAdapter</code> with a backend
            proxy URL, or Linear via <code>createLinearIssueAdapter</code>.
          </Text>

          <Stack direction="row" gap={3}>
            <Button
              type="button"
              variant="solid"
              intent="primary"
              size="md"
              onClick={() => setOpen(true)}
            >
              Open report modal
            </Button>
            {lastId && (
              <Badge intent="success" size="sm">
                Last filed: {lastId}
              </Badge>
            )}
          </Stack>

          <IssueReportModal
            open={open}
            onOpenChange={setOpen}
            enabled
            adapter={adapter}
            pathname="/workbench/feedback"
            defaultLabels={['workbench']}
            onSubmitted={(result) => setLastId(result.id)}
          />
        </Stack>
      </Card>

      <Card padding="normal">
        <Stack gap={3}>
          <Heading level={4} size="base">
            Floating FeedbackWidget
          </Heading>
          <Text size="sm" color="secondary">
            The FAB below is provided by FeedbackWidget (noop adapter). Click it
            to file a sample report.
          </Text>
          <FeedbackWidget
            enabled
            adapter={adapter}
            pathname="/workbench/feedback"
            captureConsole
            toastOnSuccess={false}
            onSubmitted={(result) => setLastId(result.id)}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
