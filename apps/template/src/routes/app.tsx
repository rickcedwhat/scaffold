import { createFileRoute, Outlet, useNavigate, useLocation, Link } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  Stack,
  Heading,
  Text,
  Badge,
  Button,
  useTheme,
} from '@scaffold/ui';
import {
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  Home,
} from 'lucide-react';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode, colors } = useTheme();

  const currentPath = location.pathname;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar width="240px">
        <SidebarHeader>
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
                fontSize: '15px',
              }}
            >
              S
            </div>
            <Heading level={4}>
              App
            </Heading>
          </Stack>
        </SidebarHeader>

        <SidebarNav>
          <SidebarSection title="Menu">
            <SidebarItem
              active={currentPath === '/app' || currentPath === '/app/'}
              icon={<LayoutDashboard size={18} />}
              onClick={() => navigate({ to: '/app' })}
            >
              Dashboard
            </SidebarItem>

            <SidebarItem
              active={currentPath === '/app/settings'}
              icon={<Settings size={18} />}
              onClick={() => navigate({ to: '/app/settings' })}
            >
              Settings
            </SidebarItem>
          </SidebarSection>
        </SidebarNav>

        <SidebarFooter>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Link to="/">
              <Button variant="ghost" size="sm" aria-label="Back to Home">
                <Stack direction="row" gap={1} align="center">
                  <Home size={14} />
                  <span>Home</span>
                </Stack>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Viewport */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            height: '56px',
            borderBottom: `1px solid ${colors.border.subtle}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bg.surface,
          }}
        >
          <Stack direction="row" gap={2} align="center">
            <Text size="sm" color="secondary">
              App
            </Text>
            <Text size="sm" color="secondary">
              /
            </Text>
            <Text size="sm" weight="semibold">
              {currentPath.includes('settings') ? 'Settings' : 'Dashboard'}
            </Text>
          </Stack>

          <Badge intent="neutral" size="sm">
            Ready
          </Badge>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
