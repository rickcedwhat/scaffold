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
  TextInput,
  Dropdown,
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
import { ComponentPlayground } from './components/ComponentPlayground';
import { COMPONENT_SOURCES } from './codeRegistry';

export type WorkbenchTab =
  | 'button'
  | 'textInput'
  | 'dropdown'
  | 'badges'
  | 'sidebar'
  | 'stack'
  | 'cards'
  | 'typography'
  | 'tokens';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('textInput');

  // isDirty interactive demo state (matching cedrickcatalan.com)
  const initialUsername = 'John Doe';
  const [username, setUsername] = useState(initialUsername);
  const isUsernameDirty = username !== initialUsername;

  // Dropdown interactive demo state
  const initialOrigin = 'downtown';
  const [origin, setOrigin] = useState(initialOrigin);
  const [orderType, setOrderType] = useState('');

  const originOptions = [
    { value: 'downtown', label: 'Downtown HQ' },
    { value: 'midtown', label: 'Midtown Office' },
    { value: 'riverside', label: 'Riverside Hub' },
  ];

  const orderTypeOptions = [
    { value: 'delivery', label: 'Priority Delivery' },
    { value: 'pickup', label: 'In-Store Pickup' },
  ];

  const tabTitles: Record<WorkbenchTab, string> = {
    button: 'Button',
    textInput: 'TextInput',
    dropdown: 'Dropdown',
    badges: 'Badges & Avatars',
    sidebar: 'Sidebar Nav',
    stack: 'Stack & Grid',
    cards: 'Cards',
    typography: 'Typography',
    tokens: 'Design Tokens',
  };

  const intents: ButtonIntent[] = ['primary', 'secondary', 'neutral', 'success', 'danger'];
  const variants: ButtonVariant[] = ['solid', 'outline', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  return (
    <PageShell>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Left Sidebar Navigation */}
        <Sidebar width={250}>
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
            <SidebarSection title="Components">
              <SidebarItem
                icon="📝"
                active={activeTab === 'textInput'}
                onClick={() => setActiveTab('textInput')}
              >
                TextInput
              </SidebarItem>
              <SidebarItem
                icon="🔽"
                active={activeTab === 'dropdown'}
                onClick={() => setActiveTab('dropdown')}
              >
                Dropdown
              </SidebarItem>
              <SidebarItem
                icon="🔘"
                active={activeTab === 'button'}
                onClick={() => setActiveTab('button')}
              >
                Button
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
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button variant="ghost" intent="neutral" size="sm" onClick={toggleMode}>
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
                  Components &rsaquo;
                </Text>
                <Heading level={2} size="base">
                  {tabTitles[activeTab]}
                </Heading>
              </Stack>

              <Stack direction="row" align="center" gap={2}>
                <Button variant="outline" intent="neutral" size="sm" onClick={toggleMode}>
                  {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
                </Button>
              </Stack>
            </Stack>
          </Header>

          {/* Main Container */}
          <Container maxWidth="xl">
            {/* TextInput Tab */}
            {activeTab === 'textInput' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="TextInput"
                  description="Outlined text field with floating label, isDirty modification feedback, and compact small (32px) vs default medium (56px) sizes."
                  sourceCode={COMPONENT_SOURCES.textInput}
                  defaultSplit
                >
                  <Stack gap={5}>
                    {/* isDirty Live Interactive Feedback */}
                    <Stack gap={1}>
                      <Text weight="semibold" size="sm">
                        Live Modification Feedback (isDirty)
                      </Text>
                      <Text size="xs" color="secondary">
                        Modify the field below to see the 4px left accent border and dirty feedback.
                      </Text>
                    </Stack>
                    <div>
                      <TextInput
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        isDirty={isUsernameDirty}
                        helperText={
                          isUsernameDirty
                            ? 'This field has been modified'
                            : `Original: "${initialUsername}"`
                        }
                      />
                      {isUsernameDirty && (
                        <div style={{ marginTop: '10px' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            intent="neutral"
                            onClick={() => setUsername(initialUsername)}
                          >
                            Reset to Original
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Sizing: Small vs Medium */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Sizes: Medium (56px default) &bull; Small (32px dense)
                        </Text>
                      </div>
                      <Stack gap={3}>
                        <TextInput
                          size="medium"
                          label="Medium Field"
                          placeholder="Default comfortable form field"
                        />
                        <TextInput
                          size="small"
                          label="Small Field"
                          placeholder="Dense 32px for toolbars/tables"
                        />
                      </Stack>
                    </div>

                    {/* Error & Disabled States */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Error &amp; Disabled States
                        </Text>
                      </div>
                      <Stack gap={3}>
                        <TextInput
                          label="Email Address"
                          error
                          defaultValue="invalid-email@"
                          helperText="Please enter a valid email address."
                        />
                        <TextInput
                          label="Locked Field"
                          disabled
                          defaultValue="system_generated_key_8849"
                          helperText="This field is read-only."
                        />
                      </Stack>
                    </div>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Dropdown Tab */}
            {activeTab === 'dropdown' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Dropdown"
                  description="Floating-label select sharing TextInput chrome. Supports options data, isDirty, placeholder empty state, and size scales."
                  sourceCode={COMPONENT_SOURCES.dropdown}
                  defaultSplit
                >
                  <Stack gap={5}>
                    {/* isDirty Dropdown Demo */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Controlled Select with isDirty
                        </Text>
                      </div>
                      <Dropdown
                        label="Location Origin"
                        value={origin}
                        options={originOptions}
                        isDirty={origin !== initialOrigin}
                        onChange={(e) => setOrigin(e.target.value)}
                        helperText={
                          origin !== initialOrigin
                            ? 'Selection has changed'
                            : 'Choose an operating office'
                        }
                      />
                    </div>

                    {/* Placeholder empty state */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Placeholder Empty State
                        </Text>
                      </div>
                      <Dropdown
                        label="Order Type"
                        placeholder="Select an option"
                        value={orderType}
                        options={orderTypeOptions}
                        onChange={(e) => setOrderType(e.target.value)}
                      />
                    </div>

                    {/* Error & Disabled */}
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Error &amp; Disabled
                        </Text>
                      </div>
                      <Stack gap={3}>
                        <Dropdown
                          label="Drawer"
                          error
                          placeholder="Select drawer"
                          options={[
                            { value: 'front', label: 'Front Counter' },
                            { value: 'drive', label: 'Drive-Thru' },
                          ]}
                          helperText="Drawer selection is mandatory."
                        />
                        <Dropdown
                          label="Locked Regional Gateway"
                          disabled
                          defaultValue="downtown"
                          options={originOptions}
                        />
                      </Stack>
                    </div>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Button Tab */}
            {activeTab === 'button' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Button"
                  description="Controlled component strictly accepting design tokens. Heights: sm (36px), md (44px default), lg (52px)."
                  sourceCode={COMPONENT_SOURCES.button}
                  defaultSplit
                >
                  <Stack gap={5}>
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Color Variants
                        </Text>
                      </div>
                      <Stack direction="row" align="center" gap={3}>
                        <Button intent="primary">Primary</Button>
                        <Button intent="secondary">Secondary</Button>
                        <Button intent="neutral">Neutral</Button>
                        <Button intent="success">Success</Button>
                        <Button intent="danger">Danger</Button>
                      </Stack>
                    </div>

                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Size Variants (sm: 36px &bull; md: 44px &bull; lg: 52px)
                        </Text>
                      </div>
                      <Stack direction="row" align="center" gap={3}>
                        <Button size="sm">Small (36px)</Button>
                        <Button size="md">Medium (44px)</Button>
                        <Button size="lg">Large (52px)</Button>
                      </Stack>
                    </div>

                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Visual Variants
                        </Text>
                      </div>
                      <Stack direction="row" align="center" gap={3}>
                        <Button variant="solid">Solid</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button disabled>Disabled</Button>
                        <Button loading>Loading</Button>
                      </Stack>
                    </div>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Sidebar Nav Tab */}
            {activeTab === 'sidebar' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Sidebar"
                  description="Structural navigation component supporting sections, active indicator pills, and icon/badge slots."
                  sourceCode={COMPONENT_SOURCES.sidebar}
                  defaultSplit
                >
                  <div
                    style={{
                      height: '380px',
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: tokens.radii.md,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <Sidebar width={220}>
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
                          <SidebarItem
                            icon="📊"
                            badge={
                              <Badge size="sm" intent="primary">
                                Live
                              </Badge>
                            }
                          >
                            Analytics
                          </SidebarItem>
                          <SidebarItem icon="📁">Documents</SidebarItem>
                        </SidebarSection>

                        <SidebarSection title="Settings">
                          <SidebarItem icon="👤">Profile</SidebarItem>
                          <SidebarItem icon="🔒" disabled>
                            Security
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
                        Main viewport area
                      </Text>
                    </div>
                  </div>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Card"
                  description="Cards contain content and actions about a single subject. Uses tokenized padding and surfaces."
                  sourceCode={COMPONENT_SOURCES.card}
                  defaultSplit
                >
                  <Grid minItemWidth={240} gap={4}>
                    <Card variant="surface" padding="normal">
                      <Stack gap={2}>
                        <Heading level={4} size="base">
                          Surface Card
                        </Heading>
                        <Text size="sm" color="secondary">
                          Standard surface card with default border and padding.
                        </Text>
                      </Stack>
                    </Card>

                    <Card variant="subtle" padding="normal">
                      <Stack gap={2}>
                        <Heading level={4} size="base">
                          Subtle Card
                        </Heading>
                        <Text size="sm" color="secondary">
                          Subtle card for nested content or elevated sections.
                        </Text>
                      </Stack>
                    </Card>
                  </Grid>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Badges & Avatars Tab */}
            {activeTab === 'badges' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Badge"
                  description="Badges and Avatars for visual metadata and user representation."
                  sourceCode={COMPONENT_SOURCES.badge}
                  defaultSplit
                >
                  <Stack gap={4}>
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Badge Intents
                        </Text>
                      </div>
                      <Stack direction="row" align="center" gap={2}>
                        {intents.map((i) => (
                          <Badge key={i} intent={i} size="md">
                            {i}
                          </Badge>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text weight="semibold" size="sm">
                          Avatars
                        </Text>
                      </div>
                      <Stack direction="row" align="center" gap={3}>
                        <Avatar fallback="SC" size="sm" intent="primary" />
                        <Avatar fallback="SC" size="md" intent="primary" />
                        <Avatar fallback="SC" size="lg" intent="primary" />
                        <Avatar fallback="CC" size="lg" intent="success" shape="circle" />
                        <Avatar fallback="AI" size="lg" intent="danger" shape="circle" />
                      </Stack>
                    </div>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Stack & Grid Tab */}
            {activeTab === 'stack' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Stack"
                  description="Flexbox and CSS Grid layout primitives enforcing token spacing."
                  sourceCode={COMPONENT_SOURCES.stack}
                  defaultSplit
                >
                  <Stack gap={4}>
                    <Grid minItemWidth={160} gap={3}>
                      <Card padding="compact">
                        <Text size="sm">Grid Item 1</Text>
                      </Card>
                      <Card padding="compact">
                        <Text size="sm">Grid Item 2</Text>
                      </Card>
                      <Card padding="compact">
                        <Text size="sm">Grid Item 3</Text>
                      </Card>
                    </Grid>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="Text"
                  description="Typography primitives with strict rem scales, semantic elements, and zero user-agent margin quirks."
                  sourceCode={COMPONENT_SOURCES.text}
                  defaultSplit
                >
                  <Stack gap={3}>
                    <Heading level={1}>Heading 1 (1.5rem / 24px)</Heading>
                    <Heading level={2}>Heading 2 (1.25rem / 20px)</Heading>
                    <Heading level={3}>Heading 3 (1.125rem / 18px)</Heading>
                    <Text size="lg">Large body text (1.125rem / 18px)</Text>
                    <Text size="base">Base body text (1rem / 16px)</Text>
                    <Text size="sm" color="secondary">
                      Small muted text (0.875rem / 14px)
                    </Text>
                    <Text size="xs" color="muted">
                      Caption text (0.75rem / 12px)
                    </Text>
                  </Stack>
                </ComponentPlayground>
              </Stack>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <Stack gap={6}>
                <ComponentPlayground
                  title="tokens"
                  description={`Semantic design tokens (${mode} mode) driving the entire system.`}
                  sourceCode={COMPONENT_SOURCES.tokens}
                  defaultSplit
                >
                  <Grid minItemWidth={200} gap={3}>
                    {Object.entries(colors.intent).map(([name, intentToken]) => (
                      <Card key={name} padding="compact">
                        <Stack direction="row" align="center" gap={2}>
                          <Avatar
                            fallback={name}
                            size="sm"
                            intent={name as ButtonIntent}
                            shape="rounded"
                          />
                          <Stack gap={1}>
                            <Text weight="bold" size="sm" transform="capitalize">
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
                </ComponentPlayground>
              </Stack>
            )}
          </Container>
        </div>
      </div>
    </PageShell>
  );
}
