import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  Grid,
  Button,
  useTheme,
} from '@scaffold/ui';
import {
  TrendingUp,
  FolderKanban,
  Users,
  Activity,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <Stack direction="column" gap={6}>
      {/* Title & Top Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Stack direction="column" gap={1}>
          <Heading level={2} size="xl">
            Workspace Overview
          </Heading>
          <Text size="sm" color="secondary">
            Welcome back, Alex. Here is a summary of your workspace activity.
          </Text>
        </Stack>

        <Button
          variant="solid"
          intent="primary"
          size="sm"
          onClick={() => navigate({ to: '/dashboard/projects' })}
        >
          <Stack direction="row" gap={1} align="center">
            <Plus size={16} />
            <span>New Project</span>
          </Stack>
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <Grid minItemWidth="220px" gap={4}>
        <Card padding="normal">
          <Stack direction="column" gap={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="xs" color="secondary" weight="medium">
                MONTHLY RUN RATE
              </Text>
              <TrendingUp size={16} color={colors.intent.primary.main} />
            </div>
            <Heading level={3} size="lg">
              $128,450
            </Heading>
            <Stack direction="row" gap={1} align="center">
              <Badge intent="success" size="sm">+14.2%</Badge>
              <Text size="xs" color="secondary">vs last month</Text>
            </Stack>
          </Stack>
        </Card>

        <Card padding="normal">
          <Stack direction="column" gap={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="xs" color="secondary" weight="medium">
                ACTIVE PROJECTS
              </Text>
              <FolderKanban size={16} color={colors.intent.primary.main} />
            </div>
            <Heading level={3} size="lg">
              24
            </Heading>
            <Stack direction="row" gap={1} align="center">
              <Badge intent="primary" size="sm">3 in review</Badge>
              <Text size="xs" color="secondary">4 closed this week</Text>
            </Stack>
          </Stack>
        </Card>

        <Card padding="normal">
          <Stack direction="column" gap={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="xs" color="secondary" weight="medium">
                CONTRIBUTORS
              </Text>
              <Users size={16} color={colors.intent.primary.main} />
            </div>
            <Heading level={3} size="lg">
              18
            </Heading>
            <Stack direction="row" gap={1} align="center">
              <Badge intent="neutral" size="sm">2 teams</Badge>
              <Text size="xs" color="secondary">all active today</Text>
            </Stack>
          </Stack>
        </Card>

        <Card padding="normal">
          <Stack direction="column" gap={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size="xs" color="secondary" weight="medium">
                UPTIME &amp; HEALTH
              </Text>
              <Activity size={16} color={colors.intent.primary.main} />
            </div>
            <Heading level={3} size="lg">
              99.98%
            </Heading>
            <Stack direction="row" gap={1} align="center">
              <Badge intent="success" size="sm">Operational</Badge>
              <Text size="xs" color="secondary">zero incidents</Text>
            </Stack>
          </Stack>
        </Card>
      </Grid>

      {/* Recent Activity Feed */}
      <Card padding="spacious">
        <Stack direction="column" gap={4}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={3} size="lg">
              Recent Deployment Activity
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard/projects' })}
            >
              <Stack direction="row" gap={1} align="center">
                <span>View All</span>
                <ArrowUpRight size={14} />
              </Stack>
            </Button>
          </div>

          <Stack direction="column" gap={3}>
            {[
              {
                title: 'scaffold-workbench deployment',
                desc: 'Production release v0.1.0 succeeded on Vercel',
                time: '12m ago',
                badge: 'Deployed',
                intent: 'success' as const,
              },
              {
                title: 'ESLint guardrail rule active',
                desc: '@scaffold/eslint-plugin passed all AST checks',
                time: '1h ago',
                badge: 'Verified',
                intent: 'primary' as const,
              },
              {
                title: 'TanStack Router migration',
                desc: 'File-based route tree generator compiled routeTree.gen.ts',
                time: '3h ago',
                badge: 'Completed',
                intent: 'neutral' as const,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: '8px',
                }}
              >
                <Stack direction="column" gap={1}>
                  <Text size="sm" weight="semibold">
                    {item.title}
                  </Text>
                  <Text size="xs" color="secondary">
                    {item.desc}
                  </Text>
                </Stack>

                <Stack direction="row" gap={2} align="center">
                  <Badge intent={item.intent} size="sm">
                    {item.badge}
                  </Badge>
                  <Text size="xs" color="secondary">
                    {item.time}
                  </Text>
                </Stack>
              </div>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
