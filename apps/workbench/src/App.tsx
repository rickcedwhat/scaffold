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
  Input,
  Textarea,
  Select,
  FormField,
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useTheme,
  type ButtonIntent,
  type ButtonVariant,
  type ButtonSize,
} from '@scaffold/ui';
import { CodeInspector } from './components/CodeInspector';
import { CODE_REGISTRY } from './codeRegistry';

export type WorkbenchTab =
  | 'buttons'
  | 'forms'
  | 'sidebar'
  | 'stack'
  | 'cards'
  | 'badges'
  | 'typography'
  | 'tokens';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('buttons');
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', role: 'developer', bio: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState(false);

  const activeCodeInfo = CODE_REGISTRY[activeTab] || CODE_REGISTRY.buttons;

  const tabTitles: Record<WorkbenchTab, string> = {
    buttons: 'Button Primitives',
    forms: 'Form Controls & FormField',
    sidebar: 'Sidebar Navigation Suite',
    stack: 'Stack & Grid Layout',
    cards: 'Card Surfaces',
    badges: 'Badges & Avatars',
    typography: 'Typography Scales',
    tokens: 'Semantic Design Tokens',
  };

  const intents: ButtonIntent[] = ['primary', 'secondary', 'neutral', 'success', 'danger'];
  const variants: ButtonVariant[] = ['solid', 'outline', 'subtle', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  return (
    <PageShell>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Left Sidebar Navigation */}
        <Sidebar width={260}>
          <SidebarHeader>
            <Stack direction="row" align="center" gap={3}>
              <Avatar fallback="SC" size="md" intent="primary" shape="rounded" />
              <div>
                <Heading level={1} size="base">
                  Scaffold
                </Heading>
                <Text as="span" size="xs" color="secondary">
                  UI Workbench
                </Text>
              </div>
            </Stack>
          </SidebarHeader>

          <SidebarNav>
            <SidebarSection title="Primitives">
              <SidebarItem
                icon="🔘"
                active={activeTab === 'buttons'}
                onClick={() => setActiveTab('buttons')}
              >
                Buttons
              </SidebarItem>
              <SidebarItem
                icon="📝"
                active={activeTab === 'forms'}
                onClick={() => setActiveTab('forms')}
              >
                Forms &amp; Inputs
              </SidebarItem>
              <SidebarItem
                icon="🏷️"
                active={activeTab === 'badges'}
                onClick={() => setActiveTab('badges')}
              >
                Badges &amp; Avatars
              </SidebarItem>
              <SidebarItem
                icon="🔲"
                active={activeTab === 'sidebar'}
                onClick={() => setActiveTab('sidebar')}
              >
                Sidebar Nav
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Structure & Layout">
              <SidebarItem
                icon="📐"
                active={activeTab === 'stack'}
                onClick={() => setActiveTab('stack')}
              >
                Stack &amp; Grid
              </SidebarItem>
              <SidebarItem
                icon="🃏"
                active={activeTab === 'cards'}
                onClick={() => setActiveTab('cards')}
              >
                Cards
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Foundations">
              <SidebarItem
                icon="✍️"
                active={activeTab === 'typography'}
                onClick={() => setActiveTab('typography')}
              >
                Typography
              </SidebarItem>
              <SidebarItem
                icon="🎨"
                active={activeTab === 'tokens'}
                onClick={() => setActiveTab('tokens')}
              >
                Design Tokens
              </SidebarItem>
            </SidebarSection>
          </SidebarNav>

          <SidebarFooter>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="ghost"
                intent="neutral"
                size="sm"
                onClick={toggleMode}
              >
                {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
              </Button>
              <Badge intent="neutral" size="sm">
                v0.1.0
              </Badge>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Workspace Area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Header sticky>
            <Stack direction="row" align="center" justify="between">
              <Stack direction="row" align="center" gap={2}>
                <Text size="sm" color="secondary">
                  Workbench &rsaquo;
                </Text>
                <Heading level={2} size="base">
                  {tabTitles[activeTab]}
                </Heading>
              </Stack>

              <Stack direction="row" align="center" gap={2}>
                <Button
                  variant={isCodeOpen ? 'solid' : 'outline'}
                  intent={isCodeOpen ? 'primary' : 'neutral'}
                  size="sm"
                  onClick={() => setIsCodeOpen(!isCodeOpen)}
                >
                  {isCodeOpen ? '✕ Close Code' : '<> View Live Code'}
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

        {activeTab === 'forms' && (
          <Stack gap={6}>
            <Section
              title="Interactive Form & Validation"
              description="Form controls wrapped in FormField with auto-wired accessibility (htmlFor, aria-describedby, aria-invalid) and schema validation."
            >
              <Card padding="normal">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const errors: Record<string, string> = {};
                    if (!formValues.name.trim()) {
                      errors.name = 'Full name is required.';
                    }
                    if (!formValues.email.trim()) {
                      errors.email = 'Email address is required.';
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
                      errors.email = 'Please provide a valid email address.';
                    }
                    if (!formValues.bio.trim()) {
                      errors.bio = 'Please provide a brief bio.';
                    }
                    setFormErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setFormSuccess(true);
                      setTimeout(() => setFormSuccess(false), 4000);
                    }
                  }}
                >
                  <Stack gap={4}>
                    {formSuccess && (
                      <Card variant="subtle" padding="compact">
                        <Stack direction="row" align="center" gap={2}>
                          <Badge intent="success" size="sm">Success</Badge>
                          <Text size="sm">Form submitted successfully with valid data!</Text>
                        </Stack>
                      </Card>
                    )}

                    <Grid minItemWidth={280} gap={4}>
                      <FormField
                        label="Full Name"
                        required
                        helperText="Your legal or preferred name."
                        errorMessage={formErrors.name}
                      >
                        <Input
                          placeholder="e.g. Alex Chen"
                          value={formValues.name}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </FormField>

                      <FormField
                        label="Email Address"
                        required
                        helperText="Used for authentication and notifications."
                        errorMessage={formErrors.email}
                      >
                        <Input
                          type="email"
                          placeholder="alex@company.com"
                          prefixSlot={<Text size="xs" color="muted">@</Text>}
                          value={formValues.email}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </FormField>
                    </Grid>

                    <FormField
                      label="Engineering Role"
                      helperText="Select your primary specialty."
                    >
                      <Select
                        value={formValues.role}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, role: e.target.value }))
                        }
                        options={[
                          { label: 'Software Engineer', value: 'developer' },
                          { label: 'Product Designer', value: 'designer' },
                          { label: 'Product Manager', value: 'product' },
                          { label: 'Infrastructure / DevOps', value: 'devops' },
                        ]}
                      />
                    </FormField>

                    <FormField
                      label="Biography"
                      required
                      helperText="Brief summary of your background."
                      errorMessage={formErrors.bio}
                    >
                      <Textarea
                        placeholder="Tell us a little bit about what you are building..."
                        rows={3}
                        value={formValues.bio}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, bio: e.target.value }))
                        }
                      />
                    </FormField>

                    <Stack direction="row" align="center" gap={3}>
                      <Button type="submit" intent="primary" size="md">
                        Save Profile
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        intent="neutral"
                        size="md"
                        onClick={() => {
                          setFormValues({ name: '', email: '', role: 'developer', bio: '' });
                          setFormErrors({});
                          setFormSuccess(false);
                        }}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Card>
            </Section>

            <Section
              title="Form Control Primitives & Scales"
              description="Input, Select, and Textarea scales with slots, error states, and strict styling encapsulation."
            >
              <Grid minItemWidth={320} gap={4}>
                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Input Sizes</Heading>
                    <Stack gap={3}>
                      <Input size="sm" placeholder="Size sm (32px)" />
                      <Input size="md" placeholder="Size md (40px)" />
                      <Input size="lg" placeholder="Size lg (48px)" />
                    </Stack>
                  </Stack>
                </Card>

                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Slots &amp; States</Heading>
                    <Stack gap={3}>
                      <Input
                        placeholder="Search projects..."
                        prefixSlot={
                          <span style={{ fontSize: '13px' }}>🔍</span>
                        }
                        suffixSlot={
                          <Badge size="sm" intent="neutral">ESC</Badge>
                        }
                      />
                      <Input
                        placeholder="Price amount"
                        prefixSlot={<Text size="sm" color="muted">$</Text>}
                        suffixSlot={<Text size="xs" color="muted">USD</Text>}
                        defaultValue="99.00"
                      />
                      <Input
                        hasError
                        defaultValue="invalid.payload@"
                      />
                      <Input
                        disabled
                        defaultValue="Disabled input field"
                      />
                    </Stack>
                  </Stack>
                </Card>

                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Select Controls</Heading>
                    <Stack gap={3}>
                      <Select
                        size="sm"
                        options={[
                          { label: 'Small select option', value: 'sm' },
                        ]}
                      />
                      <Select
                        size="md"
                        options={[
                          { label: 'Medium select option', value: 'md' },
                        ]}
                      />
                      <Select
                        size="lg"
                        options={[
                          { label: 'Large select option', value: 'lg' },
                        ]}
                      />
                      <Select
                        hasError
                        options={[
                          { label: 'Error state select', value: 'err' },
                        ]}
                      />
                      <Select
                        disabled
                        options={[
                          { label: 'Disabled select', value: 'dis' },
                        ]}
                      />
                    </Stack>
                  </Stack>
                </Card>

                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">Textarea Controls</Heading>
                    <Stack gap={3}>
                      <Textarea size="sm" placeholder="Small textarea" rows={2} />
                      <Textarea size="md" placeholder="Medium textarea (default)" rows={3} />
                      <Textarea hasError placeholder="Textarea with error state" rows={2} />
                      <Textarea disabled placeholder="Disabled textarea" rows={2} />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
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

        {activeTab === 'sidebar' && (
          <Stack gap={6}>
            <Section
              title="Sidebar Navigation Suite"
              description="A structural navigation component strictly encapsulating style tokens, with support for semantic sections, active indicator pills, and icon/badge slots."
            >
              <Grid minItemWidth={340} gap={4}>
                <Card padding="normal">
                  <Stack gap={3}>
                    <Heading level={4} size="base">
                      Embedded Sidebar Preview
                    </Heading>
                    <div
                      style={{
                        height: '380px',
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: tokens.radii.md,
                        overflow: 'hidden',
                        display: 'flex',
                      }}
                    >
                      <Sidebar width={240}>
                        <SidebarHeader>
                          <Stack direction="row" align="center" gap={2}>
                            <Avatar fallback="EX" size="sm" intent="primary" />
                            <Text size="sm" weight="semibold">
                              Sample Workspace
                            </Text>
                          </Stack>
                        </SidebarHeader>

                        <SidebarNav>
                          <SidebarSection title="Main">
                            <SidebarItem icon="🏠" active>
                              Dashboard
                            </SidebarItem>
                            <SidebarItem icon="📊" badge={<Badge size="sm" intent="primary">Live</Badge>}>
                              Analytics
                            </SidebarItem>
                            <SidebarItem icon="📁">
                              Documents
                            </SidebarItem>
                          </SidebarSection>

                          <SidebarSection title="Settings">
                            <SidebarItem icon="👤">
                              Profile
                            </SidebarItem>
                            <SidebarItem icon="🔒" disabled>
                              Security (Locked)
                            </SidebarItem>
                          </SidebarSection>
                        </SidebarNav>

                        <SidebarFooter>
                          <Text size="xs" color="muted">
                            Sidebar footer slot
                          </Text>
                        </SidebarFooter>
                      </Sidebar>

                      <div
                        style={{
                          flex: 1,
                          backgroundColor: colors.bg.canvas,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: tokens.spacing[4],
                        }}
                      >
                        <Text size="sm" color="secondary">
                          Main content viewport
                        </Text>
                      </div>
                    </div>
                  </Stack>
                </Card>

                <Card padding="normal">
                  <Stack gap={4}>
                    <Heading level={4} size="base">
                      Sidebar Component Features
                    </Heading>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Text weight="semibold" size="sm">
                          Polymorphic Routing
                        </Text>
                        <Text size="sm" color="secondary">
                          SidebarItem automatically renders as an accessible anchor link (<code>&lt;a href="..."&gt;</code>) when <code>href</code> is passed, or as a <code>&lt;button&gt;</code> for in-app state switching.
                        </Text>
                      </Stack>

                      <Stack gap={1}>
                        <Text weight="semibold" size="sm">
                          Active Pill Indicator &amp; ARIA
                        </Text>
                        <Text size="sm" color="secondary">
                          Active items display a tokenized vertical indicator pill and apply <code>aria-current="page"</code> for assistive technologies.
                        </Text>
                      </Stack>

                      <Stack gap={1}>
                        <Text weight="semibold" size="sm">
                          Component Guardrails
                        </Text>
                        <Text size="sm" color="secondary">
                          All sidebar sub-components strictly omit <code>className</code> and <code>style</code> props, preventing style leakage and layout drift.
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
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
        </div>

        {/* Live IDE Code Inspector Panel */}
        <CodeInspector
          title={activeCodeInfo.title}
          files={activeCodeInfo.files}
          isOpen={isCodeOpen}
          onClose={() => setIsCodeOpen(false)}
        />
      </div>
    </PageShell>
  );
}
