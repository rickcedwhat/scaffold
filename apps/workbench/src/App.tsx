import React, { useState } from 'react';
import {
  PageShell,
  Container,
  Header,
  Card,
  Grid,
  Button,
  Stack,
  useTheme,
  type ButtonIntent,
  type ButtonVariant,
  type ButtonSize,
} from '@scaffold/ui';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<'buttons' | 'stack' | 'cards' | 'tokens'>('buttons');

  const intents: ButtonIntent[] = ['primary', 'secondary', 'neutral', 'success', 'danger'];
  const variants: ButtonVariant[] = ['solid', 'outline', 'subtle', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  return (
    <PageShell>
      {/* Structural Header Component */}
      <Header sticky>
        <Stack direction="row" align="center" justify="between">
          <Stack direction="row" align="center" gap={3}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.radii.md,
                backgroundColor: colors.intent.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              SC
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: tokens.typography.fontSize.base, fontWeight: tokens.typography.fontWeight.bold }}>
                Scaffold Workbench
              </h1>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.secondary }}>
                Port 5500 &bull; Strict Design System Preview
              </span>
            </div>
          </Stack>

          <Stack direction="row" align="center" gap={2}>
            <Button
              variant={activeTab === 'buttons' ? 'solid' : 'ghost'}
              intent={activeTab === 'buttons' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('buttons')}
            >
              Buttons
            </Button>
            <Button
              variant={activeTab === 'stack' ? 'solid' : 'ghost'}
              intent={activeTab === 'stack' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('stack')}
            >
              Stack &amp; Grid
            </Button>
            <Button
              variant={activeTab === 'cards' ? 'solid' : 'ghost'}
              intent={activeTab === 'cards' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('cards')}
            >
              Cards
            </Button>
            <Button
              variant={activeTab === 'tokens' ? 'solid' : 'ghost'}
              intent={activeTab === 'tokens' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('tokens')}
            >
              Tokens
            </Button>
            <Button
              variant="outline"
              intent="neutral"
              size="sm"
              onClick={toggleMode}
            >
              {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </Stack>
        </Stack>
      </Header>

      {/* Structural Container */}
      <Container maxWidth="xl">
        {activeTab === 'buttons' && (
          <Stack gap={8}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, margin: '0 0 8px 0' }}>
                Button Intents &amp; Variants
              </h2>
              <p style={{ color: colors.text.secondary, margin: '0 0 24px 0' }}>
                Every button variant strictly derives from theme tokens. No arbitrary classes or custom hex codes allowed.
              </p>

              <Grid minItemWidth={280} gap={6}>
                {variants.map((v) => (
                  <Card key={v} padding="normal">
                    <h3 style={{ textTransform: 'capitalize', margin: '0 0 16px 0', fontSize: tokens.typography.fontSize.base }}>
                      Variant: {v}
                    </h3>
                    <Stack gap={3}>
                      {intents.map((i) => (
                        <Button key={i} variant={v} intent={i}>
                          {i.charAt(0).toUpperCase() + i.slice(1)} ({v})
                        </Button>
                      ))}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </section>

            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, margin: '0 0 16px 0' }}>
                Button Sizes &amp; States
              </h2>
              <Card padding="normal">
                <Stack gap={5}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Sizes (sm, md, lg)</h4>
                    <Stack direction="row" align="center" gap={3}>
                      {sizes.map((s) => (
                        <Button key={s} size={s}>
                          Size {s.toUpperCase()}
                        </Button>
                      ))}
                    </Stack>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>States (Disabled, Loading)</h4>
                    <Stack direction="row" align="center" gap={3}>
                      <Button disabled>Disabled Solid</Button>
                      <Button variant="outline" disabled>Disabled Outline</Button>
                      <Button loading>Loading State</Button>
                      <Button variant="subtle" intent="success" loading>Saving...</Button>
                    </Stack>
                  </div>
                </Stack>
              </Card>
            </section>
          </Stack>
        )}

        {activeTab === 'stack' && (
          <Stack gap={6}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, margin: '0 0 8px 0' }}>
                Stack &amp; Grid Primitives
              </h2>
              <p style={{ color: colors.text.secondary, margin: '0 0 16px 0' }}>
                Governs layouts with strict design token spacing, eliminating the need for AI to guess margins or paddings.
              </p>

              <Card padding="spacious">
                <h4 style={{ margin: '0 0 16px 0' }}>Horizontal Row with Wrap (gap=3)</h4>
                <Stack direction="row" align="center" gap={3} wrap>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} variant="subtle" padding="compact">
                      Stack Block {item}
                    </Card>
                  ))}
                </Stack>
              </Card>
            </section>
          </Stack>
        )}

        {activeTab === 'cards' && (
          <Stack gap={6}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, margin: '0 0 8px 0' }}>
                Card Variants &amp; Paddings
              </h2>
              <p style={{ color: colors.text.secondary, margin: '0 0 24px 0' }}>
                Structured surface blocks providing elevation and grouping without arbitrary CSS styling.
              </p>

              <Grid minItemWidth={300} gap={6}>
                <Card variant="surface" padding="normal">
                  <h4 style={{ margin: '0 0 8px 0' }}>Surface Card (Normal)</h4>
                  <p style={{ margin: 0, color: colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
                    Standard elevated surface with subtle border.
                  </p>
                </Card>

                <Card variant="subtle" padding="normal">
                  <h4 style={{ margin: '0 0 8px 0' }}>Subtle Card (Normal)</h4>
                  <p style={{ margin: 0, color: colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
                    Muted background surface for secondary content.
                  </p>
                </Card>

                <Card variant="outline" padding="normal">
                  <h4 style={{ margin: '0 0 8px 0' }}>Outline Card (Normal)</h4>
                  <p style={{ margin: 0, color: colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
                    Transparent background with default border.
                  </p>
                </Card>
              </Grid>
            </section>
          </Stack>
        )}

        {activeTab === 'tokens' && (
          <Stack gap={6}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, margin: '0 0 8px 0' }}>
                Semantic Color Tokens ({mode} mode)
              </h2>
              <Grid minItemWidth={200} gap={4}>
                {Object.entries(colors.intent).map(([name, intentToken]) => (
                  <Card key={name} padding="none">
                    <div style={{ height: '60px', backgroundColor: intentToken.main }} />
                    <div style={{ padding: tokens.spacing[3] }}>
                      <strong style={{ display: 'block', textTransform: 'capitalize' }}>{name}</strong>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.muted }}>
                        {intentToken.main}
                      </span>
                    </div>
                  </Card>
                ))}
              </Grid>
            </section>
          </Stack>
        )}
      </Container>
    </PageShell>
  );
}
