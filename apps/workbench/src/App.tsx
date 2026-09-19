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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Tooltip,
  toast,
  Toaster,
  Skeleton,
  EmptyState,
  StatusIllustration,
  type ButtonIntent,
  type IllustrationPreset,
  type SkeletonAnimation,
  type EmptyStateSize,
  type EmptyStateLayout,
} from '@scaffold/ui';
import { ComponentExample } from './components/ComponentExample';
import { SNIPPETS } from './snippets';
import {
  FormInput,
  ChevronsUpDown,
  MousePointerClick,
  Tag,
  PanelLeft,
  LayoutGrid,
  CreditCard,
  Type,
  Palette,
  Moon,
  Sun,
  Home,
  BarChart3,
  Folder,
  User,
  Lock,
  Layers,
  Bell,
  Inbox,
  Loader2,
  Zap,
} from 'lucide-react';
import { useRenderStorm } from '@scaffold/core';

export type WorkbenchTab =
  | 'button'
  | 'textInput'
  | 'dropdown'
  | 'overlays'
  | 'toasts'
  | 'emptyStates'
  | 'skeletons'
  | 'circuitBreaker'
  | 'badges'
  | 'sidebar'
  | 'stack'
  | 'cards'
  | 'typography'
  | 'tokens';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('textInput');

  // Circuit Breaker interactive simulation state
  const {
    breaker,
    state: circuitState,
    velocity: currentVelocity,
    reset: resetCircuit,
    mute: muteCircuit,
  } = useRenderStorm();
  const [stormLogs, setStormLogs] = useState<string[]>([]);
  const [simulatedQueryCount, setSimulatedQueryCount] = useState(0);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setStormLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleSafeQuery = async () => {
    try {
      await breaker.execute('api/projects/list', async () => {
        setSimulatedQueryCount((c) => c + 1);
        addLog('✓ Executed safe query: api/projects/list');
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Blocked: ${msg}`);
    }
  };

  const handleTriggerStorm = async () => {
    addLog('⚡ Initiating runaway render storm simulation (25 rapid calls)...');
    for (let i = 1; i <= 25; i++) {
      try {
        await breaker.execute('api/analytics/realtime-stream', async () => {
          setSimulatedQueryCount((c) => c + 1);
          addLog(`✓ Call #${i} dispatched`);
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`🛑 HALTED by Circuit Breaker at call #${i}: ${msg}`);
        break;
      }
      await new Promise((r) => setTimeout(r, 16));
    }
  };

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

  const [emptyPreset, setEmptyPreset] = useState<IllustrationPreset>('search');
  const [emptySize, setEmptySize] = useState<EmptyStateSize>('md');
  const [emptyLayout, setEmptyLayout] = useState<EmptyStateLayout>('vertical');
  const [emptyBordered, setEmptyBordered] = useState(false);

  const [skeletonAnimation, setSkeletonAnimation] = useState<SkeletonAnimation>('pulse');

  const tabTitles: Record<WorkbenchTab, string> = {
    button: 'Button',
    textInput: 'TextInput',
    dropdown: 'Dropdown',
    overlays: 'Overlays',
    toasts: 'Toasts',
    emptyStates: 'Empty States',
    skeletons: 'Skeletons',
    circuitBreaker: 'Circuit Breaker',
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
                icon={<FormInput size={16} />}
                active={activeTab === 'textInput'}
                onClick={() => setActiveTab('textInput')}
              >
                TextInput
              </SidebarItem>
              <SidebarItem
                icon={<ChevronsUpDown size={16} />}
                active={activeTab === 'dropdown'}
                onClick={() => setActiveTab('dropdown')}
              >
                Dropdown
              </SidebarItem>
              <SidebarItem
                icon={<MousePointerClick size={16} />}
                active={activeTab === 'button'}
                onClick={() => setActiveTab('button')}
              >
                Button
              </SidebarItem>
              <SidebarItem
                icon={<Tag size={16} />}
                active={activeTab === 'badges'}
                onClick={() => setActiveTab('badges')}
              >
                Badges &amp; Avatars
              </SidebarItem>
              <SidebarItem
                icon={<PanelLeft size={16} />}
                active={activeTab === 'sidebar'}
                onClick={() => setActiveTab('sidebar')}
              >
                Sidebar Nav
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Overlays & Feedback">
              <SidebarItem
                icon={<Layers size={16} />}
                active={activeTab === 'overlays'}
                onClick={() => setActiveTab('overlays')}
              >
                Overlays
              </SidebarItem>
              <SidebarItem
                icon={<Bell size={16} />}
                active={activeTab === 'toasts'}
                onClick={() => setActiveTab('toasts')}
              >
                Toasts
              </SidebarItem>
              <SidebarItem
                icon={<Inbox size={16} />}
                active={activeTab === 'emptyStates'}
                onClick={() => setActiveTab('emptyStates')}
              >
                Empty States
              </SidebarItem>
              <SidebarItem
                icon={<Loader2 size={16} />}
                active={activeTab === 'skeletons'}
                onClick={() => setActiveTab('skeletons')}
              >
                Skeletons
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Core & Reliability">
              <SidebarItem
                icon={<Zap size={16} />}
                active={activeTab === 'circuitBreaker'}
                onClick={() => setActiveTab('circuitBreaker')}
              >
                Circuit Breaker
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Structure & Layout">
              <SidebarItem
                icon={<LayoutGrid size={16} />}
                active={activeTab === 'stack'}
                onClick={() => setActiveTab('stack')}
              >
                Stack &amp; Grid
              </SidebarItem>
              <SidebarItem
                icon={<CreditCard size={16} />}
                active={activeTab === 'cards'}
                onClick={() => setActiveTab('cards')}
              >
                Cards
              </SidebarItem>
            </SidebarSection>

            <SidebarSection title="Foundations">
              <SidebarItem
                icon={<Type size={16} />}
                active={activeTab === 'typography'}
                onClick={() => setActiveTab('typography')}
              >
                Typography
              </SidebarItem>
              <SidebarItem
                icon={<Palette size={16} />}
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {mode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{mode === 'light' ? 'Dark' : 'Light'}</span>
                </span>
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {mode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                    <span>{mode === 'light' ? 'Dark' : 'Light'}</span>
                  </span>
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
                          <SidebarItem icon={<Home size={16} />} active>
                            Dashboard
                          </SidebarItem>
                          <SidebarItem
                            icon={<BarChart3 size={16} />}
                            badge={
                              <Badge size="sm" intent="primary">
                                Live
                              </Badge>
                            }
                          >
                            Analytics
                          </SidebarItem>
                          <SidebarItem icon={<Folder size={16} />}>Documents</SidebarItem>
                        </SidebarSection>

                        <SidebarSection title="Settings">
                          <SidebarItem icon={<User size={16} />}>Profile</SidebarItem>
                          <SidebarItem icon={<Lock size={16} />} disabled>
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

            {/* Overlays Tab */}
            {activeTab === 'overlays' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Overlay Primitives
                  </Heading>
                  <Text size="sm" color="secondary">
                    Radix UI headless engines wrapped in strict design token styles with keyboard navigation, focus trapping, and zero styling leakage.
                  </Text>
                </div>

                <ComponentExample
                  title="Dialog / Modal"
                  description="Accessible modal dialog with backdrop blur, focus trapping, and semantic layout."
                  code={SNIPPETS.overlays.dialog}
                  defaultExpanded={false}
                >
                  <Dialog>
                    <DialogTrigger>
                      <Button intent="primary">Open Deployment Dialog</Button>
                    </DialogTrigger>
                    <DialogContent size="md">
                      <DialogHeader>
                        <DialogTitle>Confirm Production Deployment</DialogTitle>
                        <DialogDescription>
                          This action will release version 2.4.0 to all active global regions.
                        </DialogDescription>
                      </DialogHeader>
                      <Stack gap={3}>
                        <Card padding="compact" variant="subtle">
                          <Text size="xs" color="muted">
                            Pre-flight checklist: 19/19 test suites passed, 0 lint warnings.
                          </Text>
                        </Card>
                        <TextInput label="Deployment Note" placeholder="Release notes or ticket ref" />
                      </Stack>
                      <DialogFooter>
                        <DialogClose>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose>
                          <Button
                            intent="primary"
                            onClick={() => toast.success('Deployment queued!')}
                          >
                            Confirm Deploy
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ComponentExample>

                <ComponentExample
                  title="Popover"
                  description="Floating card anchored to a trigger with collision detection and close button."
                  code={SNIPPETS.overlays.popover}
                  defaultExpanded={false}
                >
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="outline">Filter Settings</Button>
                    </PopoverTrigger>
                    <PopoverContent showCloseButton side="bottom" align="start">
                      <Stack gap={3}>
                        <Text weight="semibold" size="sm">Quick Filters</Text>
                        <Text size="xs" color="muted">Filter workspace projects</Text>
                        <Dropdown
                          label="Status"
                          size="small"
                          defaultValue="active"
                          options={[
                            { value: 'active', label: 'Active Projects' },
                            { value: 'archived', label: 'Archived' },
                          ]}
                        />
                        <PopoverClose>
                          <Button size="sm" intent="primary" fullWidth>
                            Apply Filters
                          </Button>
                        </PopoverClose>
                      </Stack>
                    </PopoverContent>
                  </Popover>
                </ComponentExample>

                <ComponentExample
                  title="DropdownMenu"
                  description="Accessible context actions menu with keyboard arrows and danger intent."
                  code={SNIPPETS.overlays.dropdownMenu}
                  defaultExpanded={false}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline">Project Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Manage</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => toast.info('Opened project details')}>
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.success('Project duplicated')}>
                        Duplicate Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        intent="danger"
                        onSelect={() => toast.error('Project deleted')}
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ComponentExample>

                <ComponentExample
                  title="Tooltip"
                  description="High-contrast floating helper badge with customizable placement and delays."
                  code={SNIPPETS.overlays.tooltip}
                  defaultExpanded={false}
                >
                  <Stack direction="row" gap={3} align="center">
                    <Tooltip content="Sync changes with remote repository (Cmd+S)">
                      <Button variant="outline" size="sm">Sync Repository</Button>
                    </Tooltip>
                    <Tooltip content="Create a new workspace branch" side="bottom">
                      <Button variant="ghost" size="sm">New Branch</Button>
                    </Tooltip>
                  </Stack>
                </ComponentExample>
              </Stack>
            )}

            {/* Toasts Tab */}
            {activeTab === 'toasts' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Toast Notifications
                  </Heading>
                  <Text size="sm" color="secondary">
                    Imperative and declarative feedback notifications with semantic intents, swipe dismissal, and action buttons.
                  </Text>
                </div>

                <ComponentExample
                  title="Interactive Toast Triggers"
                  description="Fire toasts from event handlers using toast(), toast.success(), toast.error(), or custom actions."
                  code={SNIPPETS.toasts.imperative}
                  defaultExpanded={false}
                >
                  <Stack gap={3}>
                    <Text size="sm" color="muted">Click any button to trigger a live toast in the bottom-right corner:</Text>
                    <Stack direction="row" gap={2} wrap>
                      <Button
                        intent="success"
                        size="sm"
                        onClick={() =>
                          toast.success('Project Deployed', {
                            description: 'Version 2.4.0 is now live.',
                          })
                        }
                      >
                        Success Toast
                      </Button>
                      <Button
                        intent="danger"
                        size="sm"
                        onClick={() =>
                          toast.error('Deployment Failed', {
                            description: 'Check CI pipeline logs for stack trace.',
                          })
                        }
                      >
                        Error Toast
                      </Button>
                      <Button
                        intent="primary"
                        size="sm"
                        onClick={() =>
                          toast.info('Index Rebuilt', {
                            description: '148 documents re-indexed.',
                          })
                        }
                      >
                        Info Toast
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: 'Project Archived',
                            description: 'Moved to workspace archive.',
                            intent: 'warning',
                            action: {
                              label: 'Undo',
                              onClick: () => toast.success('Archival undone!'),
                            },
                          })
                        }
                      >
                        Toast with Action
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.clear()}
                      >
                        Clear All
                      </Button>
                    </Stack>
                  </Stack>
                </ComponentExample>
              </Stack>
            )}

            {/* Empty States Tab */}
            {activeTab === 'emptyStates' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Empty States &amp; Status Illustrations
                  </Heading>
                  <Text size="sm" color="secondary">
                    Cohesive vector illustrations and empty state surfaces for zero data, search misses, 404 routes, and network feedback.
                  </Text>
                </div>

                <ComponentExample
                  title="Interactive EmptyState Sandbox"
                  description="Toggle presets, sizes, layout orientation, and bordered containers."
                  code={SNIPPETS.emptyStates.presets}
                  defaultExpanded={false}
                >
                  <Stack gap={4}>
                    <Stack direction="row" gap={3} wrap align="center">
                      <Stack direction="row" gap={1} align="center">
                        <Text size="xs" weight="medium" color="secondary">Preset:</Text>
                        {(['search', 'empty', 'not-found', 'error', 'success'] as IllustrationPreset[]).map((p) => (
                          <Button
                            key={p}
                            size="sm"
                            variant={emptyPreset === p ? 'solid' : 'outline'}
                            intent={emptyPreset === p ? 'primary' : 'neutral'}
                            onClick={() => setEmptyPreset(p)}
                          >
                            {p}
                          </Button>
                        ))}
                      </Stack>

                      <Stack direction="row" gap={1} align="center">
                        <Text size="xs" weight="medium" color="secondary">Size:</Text>
                        {(['sm', 'md', 'lg'] as EmptyStateSize[]).map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={emptySize === s ? 'solid' : 'outline'}
                            intent={emptySize === s ? 'primary' : 'neutral'}
                            onClick={() => setEmptySize(s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </Stack>

                      <Stack direction="row" gap={1} align="center">
                        <Text size="xs" weight="medium" color="secondary">Layout:</Text>
                        <Button
                          size="sm"
                          variant={emptyLayout === 'vertical' ? 'solid' : 'outline'}
                          intent={emptyLayout === 'vertical' ? 'primary' : 'neutral'}
                          onClick={() => setEmptyLayout('vertical')}
                        >
                          Vertical
                        </Button>
                        <Button
                          size="sm"
                          variant={emptyLayout === 'horizontal' ? 'solid' : 'outline'}
                          intent={emptyLayout === 'horizontal' ? 'primary' : 'neutral'}
                          onClick={() => setEmptyLayout('horizontal')}
                        >
                          Horizontal
                        </Button>
                      </Stack>

                      <Button
                        size="sm"
                        variant={emptyBordered ? 'solid' : 'outline'}
                        intent={emptyBordered ? 'primary' : 'neutral'}
                        onClick={() => setEmptyBordered(!emptyBordered)}
                      >
                        {emptyBordered ? 'Bordered: On' : 'Bordered: Off'}
                      </Button>
                    </Stack>

                    <Card padding="normal" variant="subtle">
                      <EmptyState
                        preset={emptyPreset}
                        size={emptySize}
                        layout={emptyLayout}
                        bordered={emptyBordered}
                        title={
                          emptyPreset === 'search'
                            ? 'No matching results'
                            : emptyPreset === 'not-found'
                            ? 'Page not found'
                            : emptyPreset === 'error'
                            ? 'Connection failed'
                            : emptyPreset === 'success'
                            ? 'Action completed'
                            : 'No records created yet'
                        }
                        description={
                          emptyPreset === 'search'
                            ? 'Check your keywords or remove search filters to expand queries.'
                            : emptyPreset === 'not-found'
                            ? 'The resource you were looking for has been moved or deleted.'
                            : emptyPreset === 'error'
                            ? 'Unable to communicate with the remote API server. Retrying...'
                            : emptyPreset === 'success'
                            ? 'All changes have been successfully persisted to storage.'
                            : 'Get started by initializing your very first project item.'
                        }
                        action={
                          <Button intent={emptyPreset === 'error' ? 'danger' : 'primary'} size={emptySize === 'sm' ? 'sm' : 'md'}>
                            {emptyPreset === 'search'
                              ? 'Clear Filters'
                              : emptyPreset === 'error'
                              ? 'Retry Connection'
                              : emptyPreset === 'success'
                              ? 'Continue'
                              : 'Create New Item'}
                          </Button>
                        }
                        secondaryAction={
                          <Button variant="ghost" size={emptySize === 'sm' ? 'sm' : 'md'}>
                            Documentation
                          </Button>
                        }
                      />
                    </Card>
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="All Status Illustration Presets"
                  description="Built-in vector illustrations styled with design system tokens and fluid motion."
                  code={SNIPPETS.emptyStates.illustration}
                  defaultExpanded={false}
                >
                  <Grid minItemWidth={180} gap={4}>
                    {(['search', 'empty', 'not-found', 'error', 'success'] as IllustrationPreset[]).map((p) => (
                      <Card key={p} padding="normal">
                        <Stack align="center" gap={3}>
                          <StatusIllustration preset={p} size="md" />
                          <Text weight="medium" size="sm" transform="capitalize">
                            {p}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </ComponentExample>
              </Stack>
            )}

            {/* Skeletons Tab */}
            {activeTab === 'skeletons' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Skeletons
                  </Heading>
                  <Text size="sm" color="secondary">
                    Low-contrast placeholders that pulse or shine while asynchronous data loads, avoiding layout shift.
                  </Text>
                </div>

                <ComponentExample
                  title="Card &amp; Content Loading Patterns"
                  description="Composed skeleton patterns for cards, profiles, and media blocks."
                  code={SNIPPETS.skeletons.variants}
                  defaultExpanded={false}
                >
                  <Stack gap={4}>
                    <Stack direction="row" gap={2} align="center">
                      <Text size="xs" weight="medium" color="secondary">Animation Mode:</Text>
                      {(['pulse', 'wave', 'none'] as SkeletonAnimation[]).map((anim) => (
                        <Button
                          key={anim}
                          size="sm"
                          variant={skeletonAnimation === anim ? 'solid' : 'outline'}
                          intent={skeletonAnimation === anim ? 'primary' : 'neutral'}
                          onClick={() => setSkeletonAnimation(anim)}
                        >
                          {anim}
                        </Button>
                      ))}
                    </Stack>

                    <Grid minItemWidth={280} gap={4}>
                      {/* Profile Card Skeleton */}
                      <Card padding="normal">
                        <Stack gap={4}>
                          <Stack direction="row" align="center" gap={3}>
                            <Skeleton
                              variant="circular"
                              width={48}
                              height={48}
                              animation={skeletonAnimation}
                            />
                            <div style={{ flex: 1 }}>
                              <Stack gap={2}>
                                <Skeleton
                                  variant="text"
                                  width="60%"
                                  height={18}
                                  animation={skeletonAnimation}
                                />
                                <Skeleton
                                  variant="text"
                                  width="40%"
                                  height={14}
                                  animation={skeletonAnimation}
                                />
                              </Stack>
                            </div>
                          </Stack>

                          <Skeleton
                            variant="text"
                            lines={3}
                            height={14}
                            animation={skeletonAnimation}
                          />

                          <Stack direction="row" justify="between" align="center">
                            <Skeleton
                              variant="rounded"
                              width={80}
                              height={28}
                              animation={skeletonAnimation}
                            />
                            <Skeleton
                              variant="rounded"
                              width={100}
                              height={36}
                              animation={skeletonAnimation}
                            />
                          </Stack>
                        </Stack>
                      </Card>

                      {/* Media Card Skeleton */}
                      <Card padding="normal">
                        <Stack gap={3}>
                          <Skeleton
                            variant="rounded"
                            height={140}
                            animation={skeletonAnimation}
                          />
                          <Skeleton
                            variant="text"
                            width="75%"
                            height={20}
                            animation={skeletonAnimation}
                          />
                          <Skeleton
                            variant="text"
                            lines={2}
                            height={14}
                            animation={skeletonAnimation}
                          />
                          <Skeleton
                            variant="rounded"
                            width={110}
                            height={36}
                            animation={skeletonAnimation}
                          />
                        </Stack>
                      </Card>
                    </Grid>
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="Multi-Line Paragraph Tapering"
                  description="Text skeletons automatically taper the final line for natural typography rhythm."
                  code={SNIPPETS.skeletons.multiline}
                  defaultExpanded={false}
                >
                  <Card padding="normal" variant="subtle">
                    <Stack gap={4}>
                      <Skeleton variant="text" width="40%" height={24} animation={skeletonAnimation} />
                      <Skeleton variant="text" lines={5} height={16} animation={skeletonAnimation} />
                    </Stack>
                  </Card>
                </ComponentExample>
              </Stack>
            )}

            {/* Circuit Breaker Tab */}
            {activeTab === 'circuitBreaker' && (
              <Stack gap={6}>
                <div>
                  <Heading level={3} size="lg">
                    Render-Storm Circuit Breaker
                  </Heading>
                  <Text size="sm" color="secondary">
                    Velocity-tracking throttler active in development mode. Halts runaway query/render loops and displays an immediate diagnostic overlay (philosophy.md § 7).
                  </Text>
                </div>

                <ComponentExample
                  title="Interactive Storm Simulator"
                  description="Fire safe isolated requests, or simulate a runaway component re-render loop to watch the circuit breaker trip and display the developer diagnostic overlay."
                  code={SNIPPETS.circuitBreaker.protectQuery}
                  defaultExpanded={false}
                >
                  <Stack gap={5}>
                    {/* Live Telemetry Bar */}
                    <Card padding="normal" variant="subtle">
                      <Grid minItemWidth={200} gap={4}>
                        <Stack gap={1}>
                          <Text size="xs" color="muted" weight="medium">
                            Circuit Breaker State
                          </Text>
                          <Stack direction="row" align="center" gap={2}>
                            <Badge
                              intent={
                                circuitState === 'closed'
                                  ? 'success'
                                  : circuitState === 'open'
                                  ? 'danger'
                                  : 'neutral'
                              }
                              size="md"
                            >
                              {circuitState.toUpperCase()}
                            </Badge>
                            {circuitState === 'open' && (
                              <Text size="xs" color="danger" weight="semibold">
                                Requests Halted
                              </Text>
                            )}
                          </Stack>
                        </Stack>

                        <Stack gap={1}>
                          <Text size="xs" color="muted" weight="medium">
                            Live Request Velocity
                          </Text>
                          <Stack direction="row" align="baseline" gap={2}>
                            <Text
                              size="xl"
                              weight="bold"
                              color={currentVelocity > 10 ? 'danger' : 'primary'}
                            >
                              {currentVelocity.toFixed(1)}
                            </Text>
                            <Text size="xs" color="secondary">
                              req/sec (Threshold: 10/sec)
                            </Text>
                          </Stack>
                        </Stack>

                        <Stack gap={1}>
                          <Text size="xs" color="muted" weight="medium">
                            Total Dispatched Queries
                          </Text>
                          <Text size="xl" weight="bold">
                            {simulatedQueryCount}
                          </Text>
                        </Stack>
                      </Grid>
                    </Card>

                    {/* Simulation Controls */}
                    <Stack direction="row" gap={3} wrap align="center">
                      <Button
                        intent="neutral"
                        onClick={handleSafeQuery}
                        disabled={circuitState === 'open'}
                      >
                        Execute Safe Query (1 req)
                      </Button>

                      <Button
                        intent="danger"
                        onClick={handleTriggerStorm}
                        disabled={circuitState === 'open'}
                      >
                        ⚡ Trigger Render Storm (25 reqs / 400ms)
                      </Button>

                      <Button
                        intent="primary"
                        variant="outline"
                        onClick={() => {
                          resetCircuit();
                          addLog('↺ Circuit breaker manually reset to CLOSED.');
                        }}
                      >
                        Reset Circuit Breaker
                      </Button>

                      <Button
                        intent="neutral"
                        variant="ghost"
                        onClick={() => {
                          muteCircuit(30000);
                          addLog('🔇 Circuit breaker muted for 30 seconds.');
                        }}
                      >
                        Mute 30s
                      </Button>
                    </Stack>

                    {/* Live Event Stream / Console */}
                    <Card padding="compact" variant="outline">
                      <Stack gap={2}>
                        <Stack direction="row" justify="between" align="center">
                          <Text size="xs" weight="semibold" color="secondary">
                            Live Simulation Event Log
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStormLogs([])}
                          >
                            Clear Log
                          </Button>
                        </Stack>
                        <div
                          style={{
                            backgroundColor: colors.bg.canvas,
                            borderRadius: tokens.radii.sm,
                            padding: tokens.spacing[3],
                            minHeight: '140px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            fontFamily: tokens.typography.fontFamily.mono,
                            fontSize: tokens.typography.fontSize.xs,
                            lineHeight: tokens.typography.lineHeight.normal,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            border: `1px solid ${colors.border.subtle}`,
                          }}
                        >
                          {stormLogs.length === 0 ? (
                            <span style={{ color: colors.text.muted }}>
                              Ready. Click &quot;Execute Safe Query&quot; or &quot;⚡ Trigger Render Storm&quot; to see the circuit breaker in action.
                            </span>
                          ) : (
                            stormLogs.map((log, index) => (
                              <div
                                key={index}
                                style={{
                                  color: log.includes('🛑') || log.includes('❌')
                                    ? colors.intent.danger.main
                                    : log.includes('⚡')
                                    ? colors.intent.primary.main
                                    : colors.text.primary,
                                }}
                              >
                                {log}
                              </div>
                            ))
                          )}
                        </div>
                      </Stack>
                    </Card>
                  </Stack>
                </ComponentExample>

                <ComponentExample
                  title="App-Wide Provider Integration"
                  description="Wrap the root application tree with RenderStormProvider to automatically catch runaway queries across all routes."
                  code={SNIPPETS.circuitBreaker.provider}
                  defaultExpanded={false}
                >
                  <Text size="sm" color="secondary">
                    Mounting <code>&lt;RenderStormProvider&gt;</code> in development exposes the <code>useRenderStorm()</code> hook and renders the <code>&lt;RenderStormOverlay&gt;</code> floating diagnostic banner whenever an unstable component loop is tripped.
                  </Text>
                </ComponentExample>

                <ComponentExample
                  title="Custom Circuit Breaker Configuration"
                  description="Customize the rolling window, max velocity threshold, and cooldown timing for specific heavy workloads."
                  code={SNIPPETS.circuitBreaker.customBreaker}
                  defaultExpanded={false}
                >
                  <Text size="sm" color="secondary">
                    Instantiate custom <code>CircuitBreaker</code> instances for specific endpoints or microservices that need looser or stricter trip boundaries.
                  </Text>
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
      <Toaster position="bottom-right" />
    </PageShell>
  );
}
