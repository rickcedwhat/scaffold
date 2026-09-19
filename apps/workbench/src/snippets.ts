export const SNIPPETS = {
  textInput: {
    isDirty: `// Floating label with isDirty modification indicator
const [username, setUsername] = useState('John Doe');
const isDirty = username !== 'John Doe';

<TextInput
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  isDirty={isDirty}
  helperText={isDirty ? 'This field has been modified' : 'Original: "John Doe"'}
/>`,
    sizes: `// Sizing: Default medium (56px) vs dense small (32px)
<TextInput
  size="medium"
  label="Medium Field (56px)"
  placeholder="Default comfortable form field"
/>

<TextInput
  size="small"
  label="Small Field (32px)"
  placeholder="Dense 32px for toolbars/tables"
/>`,
    states: `// Error and disabled states
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
/>`,
  },

  dropdown: {
    isDirty: `// Controlled select sharing TextInput chrome with isDirty indicator
const [origin, setOrigin] = useState('downtown');

<Dropdown
  label="Location Origin"
  value={origin}
  options={[
    { value: 'downtown', label: 'Downtown HQ' },
    { value: 'midtown', label: 'Midtown Office' },
    { value: 'riverside', label: 'Riverside Hub' },
  ]}
  isDirty={origin !== 'downtown'}
  onChange={(e) => setOrigin(e.target.value)}
  helperText={origin !== 'downtown' ? 'Selection has changed' : 'Choose an operating office'}
/>`,
    placeholder: `// Placeholder empty state
<Dropdown
  label="Order Type"
  placeholder="Select an option"
  value={orderType}
  options={[
    { value: 'delivery', label: 'Priority Delivery' },
    { value: 'pickup', label: 'In-Store Pickup' },
  ]}
  onChange={(e) => setOrderType(e.target.value)}
/>`,
    states: `// Error and disabled states
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
/>`,
  },

  button: {
    intents: `// Semantic intent colors (strictly design tokens)
<Stack direction="row" align="center" gap={3}>
  <Button intent="primary">Primary</Button>
  <Button intent="secondary">Secondary</Button>
  <Button intent="neutral">Neutral</Button>
  <Button intent="success">Success</Button>
  <Button intent="danger">Danger</Button>
</Stack>`,
    sizes: `// Height scale: sm (36px) · md (44px) · lg (52px)
<Stack direction="row" align="center" gap={3}>
  <Button size="sm">Small (36px)</Button>
  <Button size="md">Medium (44px)</Button>
  <Button size="lg">Large (52px)</Button>
</Stack>`,
    variants: `// Visual styles & states
<Stack direction="row" align="center" gap={3}>
  <Button variant="solid">Solid</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button disabled>Disabled</Button>
  <Button loading>Loading</Button>
</Stack>`,
  },

  sidebar: {
    nav: `// Structured navigation suite
<Sidebar width={240}>
  <SidebarHeader>
    <Stack direction="row" align="center" gap={2}>
      <Avatar fallback="SC" size="sm" intent="primary" />
      <Text size="sm" weight="semibold">Sample App</Text>
    </Stack>
  </SidebarHeader>

  <SidebarNav>
    <SidebarSection title="Main">
      <SidebarItem icon={<Home size={16} />} active>Dashboard</SidebarItem>
      <SidebarItem icon={<BarChart3 size={16} />} badge={<Badge size="sm" intent="primary">Live</Badge>}>
        Analytics
      </SidebarItem>
      <SidebarItem icon={<Folder size={16} />}>Documents</SidebarItem>
    </SidebarSection>

    <SidebarSection title="Settings">
      <SidebarItem icon={<User size={16} />}>Profile</SidebarItem>
      <SidebarItem icon={<Lock size={16} />} disabled>Security</SidebarItem>
    </SidebarSection>
  </SidebarNav>

  <SidebarFooter>
    <Text size="xs" color="muted">v0.1.0 • Connected</Text>
  </SidebarFooter>
</Sidebar>`,
  },

  cards: {
    cards: `// Surface and subtle card variants
<Grid minItemWidth={240} gap={4}>
  <Card variant="surface" padding="normal">
    <Stack gap={2}>
      <Heading level={4} size="base">Surface Card</Heading>
      <Text size="sm" color="secondary">
        Standard surface card with default border and padding.
      </Text>
    </Stack>
  </Card>

  <Card variant="subtle" padding="normal">
    <Stack gap={2}>
      <Heading level={4} size="base">Subtle Card</Heading>
      <Text size="sm" color="secondary">
        Subtle card for nested content or elevated sections.
      </Text>
    </Stack>
  </Card>
</Grid>`,
  },

  badges: {
    badges: `// Semantic intent badges
<Stack direction="row" align="center" gap={2}>
  <Badge intent="primary">primary</Badge>
  <Badge intent="secondary">secondary</Badge>
  <Badge intent="neutral">neutral</Badge>
  <Badge intent="success">success</Badge>
  <Badge intent="danger">danger</Badge>
  <Badge intent="warning">warning</Badge>
</Stack>`,
    avatars: `// Avatar sizes and shapes
<Stack direction="row" align="center" gap={3}>
  <Avatar fallback="SC" size="sm" intent="primary" />
  <Avatar fallback="SC" size="md" intent="primary" />
  <Avatar fallback="SC" size="lg" intent="primary" />
  <Avatar fallback="CC" size="lg" intent="success" shape="circle" />
  <Avatar fallback="AI" size="lg" intent="danger" shape="circle" />
</Stack>`,
  },

  stack: {
    grid: `// Token-enforced responsive CSS Grid
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
</Grid>`,
  },

  typography: {
    headings: `// Semantic typography with strict rem scales
<Stack gap={3}>
  <Heading level={1}>Heading 1 (1.5rem / 24px)</Heading>
  <Heading level={2}>Heading 2 (1.25rem / 20px)</Heading>
  <Heading level={3}>Heading 3 (1.125rem / 18px)</Heading>
  <Text size="lg">Large body text (1.125rem / 18px)</Text>
  <Text size="base">Base body text (1rem / 16px)</Text>
  <Text size="sm" color="secondary">Small muted text (0.875rem / 14px)</Text>
  <Text size="xs" color="muted">Caption text (0.75rem / 12px)</Text>
</Stack>`,
  },

  overlays: {
    dialog: `// Accessible Dialog / Modal with blur backdrop and token styling
<Dialog>
  <DialogTrigger>
    <Button intent="primary">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent size="md">
    <DialogHeader>
      <DialogTitle>Confirm Deployment</DialogTitle>
      <DialogDescription>
        This will immediately deploy the latest commit to production.
      </DialogDescription>
    </DialogHeader>
    <Text size="sm">Please verify you have run all test suites locally.</Text>
    <DialogFooter>
      <DialogClose>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <DialogClose>
        <Button intent="primary" onClick={() => alert('Deployed!')}>
          Confirm Deploy
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    popover: `// Floating Popover card with anchor collision handling
<Popover>
  <PopoverTrigger>
    <Button variant="outline">Filter Settings</Button>
  </PopoverTrigger>
  <PopoverContent showCloseButton side="bottom" align="start">
    <Stack gap={3}>
      <Text weight="semibold" size="sm">Quick Filters</Text>
      <Text size="xs" color="muted">Select environment target</Text>
      <Button size="sm" intent="primary">Save Filter</Button>
    </Stack>
  </PopoverContent>
</Popover>`,
    dropdownMenu: `// Keyboard-accessible DropdownMenu with semantic item intents
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">Project Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuLabel>Manage</DropdownMenuLabel>
    <DropdownMenuItem onSelect={() => console.log('Edit')}>
      Edit Details
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => console.log('Duplicate')}>
      Duplicate Project
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem intent="danger" onSelect={() => console.log('Delete')}>
      Delete Project
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    tooltip: `// Tooltip: Ergonomic single-prop wrapper or compound syntax
<Tooltip content="Sync with GitHub (Cmd+S)">
  <Button variant="outline" size="sm">Sync</Button>
</Tooltip>`,
  },

  toasts: {
    imperative: `// Trigger notifications imperatively from anywhere
import { toast, Toaster } from '@scaffold/ui';

// In root layout:
<Toaster position="bottom-right" />

// In event handlers:
toast.success('Project deployed successfully!');
toast.error('Network connection timeout');
    toast({
      title: 'Backup Complete',
      description: 'Saved 24 database snapshots to S3.',
      intent: 'primary',
      action: {
        label: 'View',
        onClick: () => console.log('View clicked'),
      },
    });`,
  },

  emptyStates: {
    presets: `// EmptyState with built-in presets: 'search' | 'empty' | 'not-found' | 'error' | 'success'
<EmptyState
  preset="search"
  title="No matching records"
  description="Try refining your search terms or clearing active filters."
  action={<Button intent="primary">Clear Search</Button>}
/>`,
    bordered: `// Compact bordered empty state card
<EmptyState
  bordered
  preset="empty"
  size="sm"
  title="No pending deployments"
  description="Every branch is currently in sync with production."
  action={<Button size="sm" intent="neutral">Trigger Manual Build</Button>}
/>`,
    illustration: `// Custom status illustration with action buttons
<EmptyState
  illustration={<StatusIllustration preset="success" size="lg" />}
  title="Order Fulfilled"
  description="All 14 items have been dispatched to the carrier."
  action={<Button intent="primary">Track Shipment</Button>}
  secondaryAction={<Button variant="ghost">Return to Orders</Button>}
/>`,
  },

  skeletons: {
    variants: `// Skeletons: text, circular (avatars), rectangular, and rounded
<Stack gap={4}>
  <Stack direction="row" align="center" gap={3}>
    <Skeleton variant="circular" width={44} height={44} />
    <Stack gap={2} style={{ flex: 1 }}>
      <Skeleton variant="text" width="50%" height={16} />
      <Skeleton variant="text" width="30%" height={12} />
    </Stack>
  </Stack>
  <Skeleton variant="rounded" height={120} />
</Stack>`,
    multiline: `// Multi-line text paragraph with natural staggered widths
<Skeleton variant="text" lines={4} height={16} />`,
    animations: `// Animation options: 'pulse' (default), 'wave', or 'none'
<Skeleton animation="pulse" height={36} />
<Skeleton animation="wave" height={36} />
<Skeleton animation="none" height={36} />`,
  },

  circuitBreaker: {
    protectQuery: `// 1. Wrap your application root with RenderStormProvider
import { RenderStormProvider } from '@scaffold/core';

export function App() {
  return (
    <RenderStormProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </RenderStormProvider>
  );
}

// 2. Protect queries from runaway render loops
import { protectQueryFn } from '@scaffold/core';

export function useProjectsQuery() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: protectQueryFn(async () => {
      const res = await fetch('/api/projects');
      return res.json();
    }, ['projects']),
  });
}`,
  },

  fab: {
    singleAction: `// Single-action Floating Action Button
import { Fab } from '@scaffold/ui';
import { Plus } from 'lucide-react';

<Fab
  label="Create New Item"
  icon={<Plus size={22} />}
  placement="bottom-right"
  intent="primary"
  onClick={() => console.log('Primary FAB clicked')}
/>`,
    speedDial: `// Expandable Speed-Dial Action Menu
import { Fab, type FabActionItem } from '@scaffold/ui';
import { Plus, FileText, Upload, Share2 } from 'lucide-react';

const actions: FabActionItem[] = [
  {
    id: 'document',
    label: 'New Document',
    icon: <FileText size={18} />,
    onClick: () => handleNewDoc(),
    intent: 'primary',
  },
  {
    id: 'upload',
    label: 'Upload File',
    icon: <Upload size={18} />,
    onClick: () => handleUpload(),
    intent: 'neutral',
  },
  {
    id: 'share',
    label: 'Share Project',
    icon: <Share2 size={18} />,
    onClick: () => handleShare(),
    intent: 'success',
  },
];

<Fab
  label="Quick Actions"
  icon={<Plus size={22} />}
  actions={actions}
  menuTrigger="click"
  placement="bottom-right"
  badge={3}
/>`,
    draggable: `// Draggable Floating Action Button with viewport boundary clamping
import { Fab } from '@scaffold/ui';
import { Sparkles } from 'lucide-react';

<Fab
  label="AI Assistant"
  icon={<Sparkles size={22} />}
  draggable={true}
  placement="bottom-right"
  offset={[24, 24]}
  badge={true}
  onClick={() => openAssistant()}
/>`,
  },
};
