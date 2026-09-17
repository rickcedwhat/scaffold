import { createFileRoute } from '@tanstack/react-router';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  useTheme,
} from '@scaffold/ui';
import { Compass } from 'lucide-react';

export const Route = createFileRoute('/app/')({
  component: DashboardCanvas,
});

function DashboardCanvas() {
  const { colors } = useTheme();

  return (
    <Stack direction="column" gap={6}>
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          Dashboard Canvas
        </Heading>
        <Text size="sm" color="secondary">
          Your clean starting canvas. No mock data or throwaway code.
        </Text>
      </Stack>

      <Card padding="spacious" variant="surface">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '48px 16px',
          }}
        >
          <Stack direction="column" gap={4} align="center">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: colors.bg.subtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.intent.primary.main,
              }}
            >
              <Compass size={24} />
            </div>

            <Stack direction="column" gap={1} align="center">
              <Heading level={3} size="lg">
                Start Building Here
              </Heading>
              <Text size="sm" color="secondary">
                Replace this placeholder by editing <Text as="code">src/routes/app/index.tsx</Text>.
              </Text>
            </Stack>

            <Badge intent="primary" size="sm">
              Ready for feature development
            </Badge>
          </Stack>
        </div>
      </Card>
    </Stack>
  );
}
