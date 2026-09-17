import { createFileRoute, Link } from '@tanstack/react-router';
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
  ArrowRight,
  Sun,
  Moon,
  FolderTree,
  Boxes,
  Sparkles,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: TemplateHome,
});

function TemplateHome() {
  const { mode, toggleMode, colors } = useTheme();

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
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              S
            </div>
            <Heading level={4}>
              Scaffold App
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
            <Link to="/app">
              <Button variant="solid" intent="primary" size="sm">
                Open App
              </Button>
            </Link>
          </Stack>
        </div>
      </Header>

      <Container maxWidth="lg">
        <Stack direction="column" gap={8}>
          {/* Minimal Hero */}
          <div
            style={{
              paddingTop: '64px',
              paddingBottom: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Stack direction="column" gap={4} align="center">
              <Badge intent="primary" size="md">
                Fresh Project Template
              </Badge>

              <Heading level={1} size="2xl">
                Ready to Build Your Product
              </Heading>

              <div style={{ maxWidth: '560px' }}>
                <Text size="lg" color="secondary">
                  A clean slate pre-wired with TanStack Router, TanStack Query,
                  and @scaffold/ui design tokens. No mock clutter to delete.
                </Text>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Link to="/app">
                  <Button variant="solid" intent="primary" size="lg">
                    <Stack direction="row" gap={2} align="center">
                      <span>Launch App</span>
                      <ArrowRight size={18} />
                    </Stack>
                  </Button>
                </Link>
              </div>
            </Stack>
          </div>

          {/* 3 Step Quick Start Guide */}
          <Grid minItemWidth="260px" gap={4}>
            <Card padding="normal" variant="surface">
              <Stack direction="column" gap={3}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: colors.bg.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.intent.primary.main,
                  }}
                >
                  <FolderTree size={18} />
                </div>
                <Heading level={4} size="base">
                  1. Add Routes
                </Heading>
                <Text size="sm" color="secondary">
                  Create new files in <Text as="code">src/routes/</Text>. TanStack Router automatically generates your type-safe route tree.
                </Text>
              </Stack>
            </Card>

            <Card padding="normal" variant="surface">
              <Stack direction="column" gap={3}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: colors.bg.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.intent.primary.main,
                  }}
                >
                  <Boxes size={18} />
                </div>
                <Heading level={4} size="base">
                  2. Use UI Primitives
                </Heading>
                <Text size="sm" color="secondary">
                  Import buttons, inputs, cards, and layouts from <Text as="code">@scaffold/ui</Text>. All styling is strictly encapsulated.
                </Text>
              </Stack>
            </Card>

            <Card padding="normal" variant="surface">
              <Stack direction="column" gap={3}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: colors.bg.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.intent.primary.main,
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <Heading level={4} size="base">
                  3. Query &amp; Mutate
                </Heading>
                <Text size="sm" color="secondary">
                  Use pre-configured TanStack Query hooks with route loader prefetching for zero-flicker state transitions.
                </Text>
              </Stack>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </PageShell>
  );
}
