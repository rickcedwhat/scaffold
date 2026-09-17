import { createFileRoute } from '@tanstack/react-router';
import { Stack, Heading, Text, Card } from '@scaffold/ui';

export const Route = createFileRoute('/app/settings')({
  component: AppSettings,
});

function AppSettings() {
  return (
    <Stack direction="column" gap={6}>
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          App Settings
        </Heading>
        <Text size="sm" color="secondary">
          Configure preferences for your application.
        </Text>
      </Stack>

      <Card padding="normal" variant="surface">
        <Text size="sm" color="secondary">
          Settings placeholder.
        </Text>
      </Card>
    </Stack>
  );
}
