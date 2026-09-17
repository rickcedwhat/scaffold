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
import { ComponentExample } from './components/ComponentExample';
import { SNIPPETS } from './snippets';

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
                <div>
                  <Heading level={3} size="lg">
                    TextInput
                  </Heading>
                  <Text size="sm" color="secondary">
                    Outlined input with floating label, modification tracking (isDirty), and multiple density sizes.
                  </Text>
                </div>

                <ComponentExample
                  title="Interactive isDirty Modification Feedback"
                  description="Displays a 4px left accent indicator and subtle tint when the value diverges from initial state."
                  code={SNIPPETS.textInput.isDirty}
                  defaultExpanded={false}
                >
                  <Stack gap={3}>
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
                      <div>
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
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Size Scale (Medium & Small)"
                  description="size='medium' (56px) for standard comfortable forms; size='small' (32px) for toolbars, filters, and dense tables."
                  code={SNIPPETS.textInput.sizes}
                  defaultExpanded={false}
                >
                  <Stack gap={3}>
                    <TextInput
                      size="medium"
                      label="Medium Field (56px)"
                      placeholder="Default comfortable form field"
                    />
                    <TextInput
                      size="small"
                      label="Small Field (32px)"
                      placeholder="Dense 32px for toolbars/tables"
                    />
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Validation & Disabled States"
                  description="Built-in error states with helper text and accessible disabled styling."
                  code={SNIPPETS.textInput.states}
                  defaultExpanded={false}
                >
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
                </ComponentExample>
              </Stack>
            )}

            {/* Dropdown Tab */}
            {activeTab === 'dropdown' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Dropdown
                  </Heading>
                  <Text size="sm" color="secondary">
                    Floating-label select sharing TextInput chrome. Accepts an options array directly as data.
                  </Text>
                </div>

                <ComponentExample
                  title="Controlled Select with isDirty"
                  description="Tracks modifications against initial option value with an accent indicator."
                  code={SNIPPETS.dropdown.isDirty}
                  defaultExpanded={false}
                >
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
                </ComponentExample>

                <ComponentExample
                  title="Placeholder Empty State"
                  description="Initial unselected state with prompt placeholder text."
                  code={SNIPPETS.dropdown.placeholder}
                  defaultExpanded={false}
                >
                  <Dropdown
                    label="Order Type"
                    placeholder="Select an option"
                    value={orderType}
                    options={orderTypeOptions}
                    onChange={(e) => setOrderType(e.target.value)}
                  />
                </ComponentExample>

                <ComponentExample
                  title="Error & Disabled States"
                  description="Required selection validation and disabled select styling."
                  code={SNIPPETS.dropdown.states}
                  defaultExpanded={false}
                >
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
                </ComponentExample>
              </Stack>
            )}

            {/* Button Tab */}
            {activeTab === 'button' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Button
                  </Heading>
                  <Text size="sm" color="secondary">
                    Buttons strictly controlled by semantic design tokens with standard heights: 36px, 44px, and 52px.
                  </Text>
                </div>

                <ComponentExample
                  title="Color Intents"
                  description="Semantic intent colors: primary, secondary, neutral, success, danger."
                  code={SNIPPETS.button.intents}
                  defaultExpanded={false}
                >
                  <Stack direction="row" align="center" gap={3} wrap>
                    <Button intent="primary">Primary</Button>
                    <Button intent="secondary">Secondary</Button>
                    <Button intent="neutral">Neutral</Button>
                    <Button intent="success">Success</Button>
                    <Button intent="danger">Danger</Button>
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Size Scale (sm, md, lg)"
                  description="Standard heights: sm (36px), md (44px default), and lg (52px)."
                  code={SNIPPETS.button.sizes}
                  defaultExpanded={false}
                >
                  <Stack direction="row" align="center" gap={3} wrap>
                    <Button size="sm">Small (36px)</Button>
                    <Button size="md">Medium (44px)</Button>
                    <Button size="lg">Large (52px)</Button>
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Visual Variants & States"
                  description="solid, outline, ghost, disabled, and loading states."
                  code={SNIPPETS.button.variants}
                  defaultExpanded={false}
                >
                  <Stack direction="row" align="center" gap={3} wrap>
                    <Button variant="solid">Solid</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button disabled>Disabled</Button>
                    <Button loading>Loading</Button>
                  </Stack>
                </ComponentExample>
              </Stack>
            )}

            {/* Sidebar Nav Tab */}
            {activeTab === 'sidebar' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Sidebar
                  </Heading>
                  <Text size="sm" color="secondary">
                    Structural navigation suite supporting sections, active indicator pills, and icon/badge slots.
                  </Text>
                </div>

                <ComponentExample
                  title="Navigation Hierarchy"
                  description="SidebarHeader, SidebarNav, SidebarSection, SidebarItem with active pills, and SidebarFooter."
                  code={SNIPPETS.sidebar.nav}
                  defaultExpanded={false}
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
                </ComponentExample>
              </Stack>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Card
                  </Heading>
                  <Text size="sm" color="secondary">
                    Cards contain content and actions about a single subject with tokenized padding and surfaces.
                  </Text>
                </div>

                <ComponentExample
                  title="Card Surfaces"
                  description="Surface vs subtle card variants for content hierarchy."
                  code={SNIPPETS.cards.cards}
                  defaultExpanded={false}
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
                </ComponentExample>
              </Stack>
            )}

            {/* Badges & Avatars Tab */}
            {activeTab === 'badges' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Badges &amp; Avatars
                  </Heading>
                  <Text size="sm" color="secondary">
                    Metadata indicators and user avatar representations.
                  </Text>
                </div>

                <ComponentExample
                  title="Badge Intents"
                  description="Semantic status badges accepting intent tokens."
                  code={SNIPPETS.badges.badges}
                  defaultExpanded={false}
                >
                  <Stack direction="row" align="center" gap={2} wrap>
                    {intents.map((i) => (
                      <Badge key={i} intent={i} size="md">
                        {i}
                      </Badge>
                    ))}
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Avatars"
                  description="Avatars with size scales (sm, md, lg) and shapes (square, circle)."
                  code={SNIPPETS.badges.avatars}
                  defaultExpanded={false}
                >
                  <Stack direction="row" align="center" gap={3} wrap>
                    <Avatar fallback="SC" size="sm" intent="primary" />
                    <Avatar fallback="SC" size="md" intent="primary" />
                    <Avatar fallback="SC" size="lg" intent="primary" />
                    <Avatar fallback="CC" size="lg" intent="success" shape="circle" />
                    <Avatar fallback="AI" size="lg" intent="danger" shape="circle" />
                  </Stack>
                </ComponentExample>
              </Stack>
            )}

            {/* Stack & Grid Tab */}
            {activeTab === 'stack' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Stack &amp; Grid
                  </Heading>
                  <Text size="sm" color="secondary">
                    Flexbox and CSS Grid layout primitives strictly enforcing token spacing.
                  </Text>
                </div>

                <ComponentExample
                  title="Responsive CSS Grid"
                  description="Auto-fitting grid based on minimum item width."
                  code={SNIPPETS.stack.grid}
                  defaultExpanded={false}
                >
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
                </ComponentExample>
              </Stack>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Typography
                  </Heading>
                  <Text size="sm" color="secondary">
                    Typography primitives with strict rem scales, semantic elements, and zero margin quirks.
                  </Text>
                </div>

                <ComponentExample
                  title="Headings & Body Scales"
                  description="Semantic headings and body text using rem units."
                  code={SNIPPETS.typography.headings}
                  defaultExpanded={false}
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
                </ComponentExample>
              </Stack>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Design Tokens
                  </Heading>
                  <Text size="sm" color="secondary">
                    Centralized semantic tokens driving colors, spacing, radii, and typography in {mode} mode.
                  </Text>
                </div>

                <ComponentExample
                  title="Active Intent Color Tokens"
                  description="Resolved token values for intents in the current theme mode."
                  code={JSON.stringify(colors.intent, null, 2)}
                  language="json"
                  defaultExpanded={false}
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
                </ComponentExample>
              </Stack>
            )}
          </Container>
        </div>
      </div>
    </PageShell>
  );
}
