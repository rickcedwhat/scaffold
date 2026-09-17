import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  PageShell,
  Container,
  Header,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  Card,
  Grid,
  useTheme,
} from '@scaffold/ui';
import {
  Route as RouteIcon,
  Database,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { mode, toggleMode, colors } = useTheme();
  const navigate = useNavigate();

  return (
    <PageShell>
      <Header sticky>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Stack direction="row" gap={2} align="center">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              S
            </div>
            <Heading level={4} size="sm">
              Scaffold Starter
            </Heading>
          </Stack>

          <Stack direction="row" gap={2} align="center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button
              variant="solid"
              intent="primary"
              size="sm"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Open Dashboard
            </Button>
          </Stack>
        </div>
      </Header>

      <Container maxWidth="xl">
        <Stack direction="column" gap={8}>
          {/* Hero Section */}
          <div
            style={{
              paddingTop: '64px',
              paddingBottom: '48px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Stack direction="column" gap={4} align="center">
              <Badge intent="primary" size="md">
                Production-Ready Stack v0.1.0
              </Badge>

              <Heading level={1} size="2xl">
                The Architectural Foundation for Personal Software
              </Heading>

              <div style={{ maxWidth: '640px' }}>
                <Text size="lg" color="secondary">
                  Pre-configured with TanStack Router, TanStack Query, React 19,
                  and strictly encapsulated design primitives. Zero style drift,
                  instant HMR, and automated quality gates.
                </Text>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Stack direction="row" gap={3} align="center">
                  <Button
                    variant="solid"
                    intent="primary"
                    size="lg"
                    onClick={() => navigate({ to: '/dashboard' })}
                  >
                    <Stack direction="row" gap={2} align="center">
                      <span>Launch Dashboard</span>
                      <ArrowRight size={18} />
                    </Stack>
                  </Button>

                  <Button
                    variant="outline"
                    intent="secondary"
                    size="lg"
                    onClick={() => navigate({ to: '/dashboard/projects' })}
                  >
                    Explore Projects
                  </Button>
                </Stack>
              </div>
            </Stack>
          </div>

          {/* Core Pillars Grid */}
          <Stack direction="column" gap={4}>
            <Heading level={2} size="xl">
              Core Architectural Standards
            </Heading>

            <Grid minItemWidth="300px" gap={4}>
              <Card padding="spacious">
                <Stack direction="column" gap={3}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: colors.bg.subtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.intent.primary.main,
                    }}
                  >
                    <RouteIcon size={20} />
                  </div>
                  <Heading level={4} size="base">
                    TanStack Router
                  </Heading>
                  <Text size="sm" color="secondary">
                    File-based routing with full TypeScript inference. Type-safe
                    search parameters, route loaders, and nested layouts out of the box.
                  </Text>
                </Stack>
              </Card>

              <Card padding="spacious">
                <Stack direction="column" gap={3}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: colors.bg.subtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.intent.primary.main,
                    }}
                  >
                    <Database size={20} />
                  </div>
                  <Heading level={4} size="base">
                    TanStack Query
                  </Heading>
                  <Text size="sm" color="secondary">
                    Standardized server state, cache deduplication, and
                    predictable query key factories with built-in route loader prefetching.
                  </Text>
                </Stack>
              </Card>

              <Card padding="spacious">
                <Stack direction="column" gap={3}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: colors.bg.subtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.intent.primary.main,
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <Heading level={4} size="base">
                    Component Guardrails
                  </Heading>
                  <Text size="sm" color="secondary">
                    Zero arbitrary className or inline style leakage. Strictly
                    encapsulated design tokens backed by custom AST lint rules.
                  </Text>
                </Stack>
              </Card>
            </Grid>
          </Stack>

          {/* Quick Stats Banner */}
          <Card padding="normal" variant="subtle">
            <Grid minItemWidth="200px" gap={4}>
              <Stack direction="column" gap={1} align="center">
                <Heading level={2} size="xl">
                  100%
                </Heading>
                <Text size="sm" color="secondary">
                  Type Safety (TypeScript 5.7)
                </Text>
              </Stack>

              <Stack direction="column" gap={1} align="center">
                <Heading level={2} size="xl">
                  &lt; 50ms
                </Heading>
                <Text size="sm" color="secondary">
                  Vite HMR & Hot Reloads
                </Text>
              </Stack>

              <Stack direction="column" gap={1} align="center">
                <Heading level={2} size="xl">
                  Strict
                </Heading>
                <Text size="sm" color="secondary">
                  ESLint AST Guardrails Active
                </Text>
              </Stack>
            </Grid>
          </Card>
        </Stack>
      </Container>
    </PageShell>
  );
}
