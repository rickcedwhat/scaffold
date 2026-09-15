import React, { useState } from 'react';
import {
  PageShell,
  Container,
  Header,
  Card,
  Grid,
  Button,
  Stack,
  Heading,
  Text,
  Section,
  Avatar,
  Badge,
  useTheme,
  type ButtonIntent,
  type ButtonVariant,
  type ButtonSize,
} from '@scaffold/ui';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<'buttons' | 'stack' | 'cards' | 'typography' | 'badges' | 'tokens'>('buttons');

  const intents: ButtonIntent[] = ['primary', 'secondary', 'neutral', 'success', 'danger'];
  const variants: ButtonVariant[] = ['solid', 'outline', 'subtle', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  return (
    <PageShell>
      {/* Structural Header */}
      <Header sticky>
        <Stack direction="row" align="center" justify="between">
          <Stack direction="row" align="center" gap={3}>
            <Avatar fallback="SC" size="md" intent="primary" shape="rounded" />
            <div>
              <Heading level={1} size="base">
                Scaffold Workbench
              </Heading>
              <Text as="span" size="xs" color="secondary">
                Port 5500 &bull; Strict Design System Preview
              </Text>
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
              variant={activeTab === 'badges' ? 'solid' : 'ghost'}
              intent={activeTab === 'badges' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('badges')}
            >
              Badges &amp; Avatars
            </Button>
            <Button
              variant={activeTab === 'typography' ? 'solid' : 'ghost'}
              intent={activeTab === 'typography' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('typography')}
            >
              Typography
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

      {/* Main Container */}
      <Container maxWidth="xl">
        {activeTab === 'buttons' && (
          <Stack gap={8}>
            <Section
              title="Button Intents & Variants"
              description="Every button variant strictly derives from theme tokens. No arbitrary classes or custom hex codes allowed."
            >
              <Grid minItemWidth={280} gap={6}>
                {variants.map((v) => (
                  <Card key={v} padding="normal">
                    <Stack gap={4}>
                      <Heading level={3} size="base" color="primary">
                        Variant: {v}
                      </Heading>
                      <Stack gap={3}>
                        {intents.map((i) => (
                          <Button key={i} variant={v} intent={i}>
                            {i.charAt(0).toUpperCase() + i.slice(1)} ({v})
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Section>

            <Section
              title="Button Sizes & States"
              description="Standard button scales and interactive feedback states."
            >
              <Card padding="normal">
                <Stack gap={5}>
                  <Stack gap={2}>
                    <Text weight="semibold">Sizes (sm, md, lg)</Text>
                    <Stack direction="row" align="center" gap={3}>
                      {sizes.map((s) => (
                        <Button key={s} size={s}>
                          Size {s.toUpperCase()}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack gap={2}>
                    <Text weight="semibold">States (Disabled, Loading)</Text>
                    <Stack direction="row" align="center" gap={3}>
                      <Button disabled>Disabled Solid</Button>
                      <Button variant="outline" disabled>Disabled Outline</Button>
                      <Button loading>Loading State</Button>
                      <Button variant="subtle" intent="success" loading>Saving...</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Section>
          </Stack>
        )}

        {activeTab === 'stack' && (
          <Section
            title="Stack & Grid Primitives"
            description="Governs layouts with strict design token spacing, eliminating the need for AI to guess margins or paddings."
          >
            <Card padding="spacious">
              <Stack gap={4}>
                <Text weight="semibold">Horizontal Row with Wrap (gap=3)</Text>
                <Stack direction="row" align="center" gap={3} wrap>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} variant="subtle" padding="compact">
                      <Text size="sm">Stack Block {item}</Text>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Section>
        )}

        {activeTab === 'cards' && (
          <Section
            title="Card Variants & Paddings"
            description="Structured surface blocks providing elevation and grouping without arbitrary CSS styling."
          >
            <Grid minItemWidth={300} gap={6}>
              <Card variant="surface" padding="normal">
                <Stack gap={2}>
                  <Heading level={4} size="base">Surface Card (Normal)</Heading>
                  <Text size="sm" color="secondary">
                    Standard elevated surface with subtle border.
                  </Text>
                </Stack>
              </Card>

              <Card variant="subtle" padding="normal">
                <Stack gap={2}>
                  <Heading level={4} size="base">Subtle Card (Normal)</Heading>
                  <Text size="sm" color="secondary">
                    Muted background surface for secondary content.
                  </Text>
                </Stack>
              </Card>

              <Card variant="outline" padding="normal">
                <Stack gap={2}>
                  <Heading level={4} size="base">Outline Card (Normal)</Heading>
                  <Text size="sm" color="secondary">
                    Transparent background with default border.
                  </Text>
                </Stack>
              </Card>
            </Grid>
          </Section>
        )}

        {activeTab === 'badges' && (
          <Stack gap={6}>
            <Section
              title="Badges & Avatars"
              description="Status indicators, tags, and identity markers using strict design tokens."
            >
              <Grid minItemWidth={300} gap={6}>
                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Badges by Intent</Heading>
                    <Stack direction="row" align="center" gap={2} wrap>
                      {intents.map((i) => (
                        <Badge key={i} intent={i} variant="subtle">
                          {i}
                        </Badge>
                      ))}
                    </Stack>
                    <Stack direction="row" align="center" gap={2} wrap>
                      {intents.map((i) => (
                        <Badge key={i} intent={i} variant="solid">
                          {i}
                        </Badge>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Avatars (Sizes & Shapes)</Heading>
                    <Stack direction="row" align="center" gap={3}>
                      <Avatar fallback="SC" size="sm" intent="primary" />
                      <Avatar fallback="SC" size="md" intent="primary" />
                      <Avatar fallback="SC" size="lg" intent="primary" />
                      <Avatar fallback="JD" size="lg" intent="success" shape="circle" />
                      <Avatar fallback="AI" size="lg" intent="danger" shape="circle" />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Section>
          </Stack>
        )}

        {activeTab === 'typography' && (
          <Stack gap={6}>
            <Section
              title="Heading & Text Primitives"
              description="Type primitives with zero user-agent margin quirks, strict token scales, and semantic elements."
            >
              <Card padding="normal">
                <Stack gap={5}>
                  <Stack gap={2}>
                    <Heading level={1}>Heading 1 (2xl scale)</Heading>
                    <Heading level={2}>Heading 2 (xl scale)</Heading>
                    <Heading level={3}>Heading 3 (lg scale)</Heading>
                    <Heading level={4}>Heading 4 (base scale)</Heading>
                  </Stack>

                  <Stack gap={2}>
                    <Text size="lg">Large body paragraph text.</Text>
                    <Text size="base">Base body paragraph text with normal weight.</Text>
                    <Text size="sm" color="secondary">Small secondary muted text description.</Text>
                    <Text size="xs" color="muted">Extra small helper caption text.</Text>
                    <div>
                      <Text as="code">git checkout -b feat/component</Text>
                    </div>
                  </Stack>
                </Stack>
              </Card>
            </Section>
          </Stack>
        )}

        {activeTab === 'tokens' && (
          <Section
            title={`Semantic Color Tokens (${mode} mode)`}
            description="Centralized color palette driving all component variants and surfaces."
          >
            <Grid minItemWidth={220} gap={4}>
              {Object.entries(colors.intent).map(([name, intentToken]) => (
                <Card key={name} padding="normal">
                  <Stack direction="row" align="center" gap={3}>
                    <Avatar fallback={name} size="md" intent={name as ButtonIntent} shape="rounded" />
                    <Stack gap={1}>
                      <Text weight="bold" transform="capitalize">
                        {name}
                      </Text>
                      <Badge intent={name as ButtonIntent} size="sm">
                        {intentToken.main}
                      </Badge>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}
      </Container>
    </PageShell>
  );
}
