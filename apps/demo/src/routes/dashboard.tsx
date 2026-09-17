import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
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
  Avatar,
  Button,
  useTheme,
} from '@scaffold/ui';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Settings,
  Sun,
  Moon,
  Home,
  Bell,
} from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
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
      {/* Left Sidebar Navigation */}
      <Sidebar width="260px">
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
            <Stack direction="column" gap={1}>
              <Heading level={4}>
                Scaffold
              </Heading>
              <Text size="xs" color="secondary">
                Starter Application
              </Text>
            </Stack>
          </Stack>
        </SidebarHeader>

        <SidebarNav>
          <SidebarSection title="Workspace">
            <SidebarItem
              active={currentPath === '/dashboard'}
              icon={<LayoutDashboard size={18} />}
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Overview
            </SidebarItem>

            <SidebarItem
              active={currentPath === '/dashboard/projects'}
              icon={<FolderKanban size={18} />}
              onClick={() => navigate({ to: '/dashboard/projects' })}
              badge={<Badge intent="primary" size="sm">Query</Badge>}
            >
              Projects
            </SidebarItem>

            <SidebarItem
              active={currentPath === '/dashboard/search'}
              icon={<Search size={18} />}
              onClick={() => navigate({ to: '/dashboard/search' })}
              badge={<Badge intent="neutral" size="sm">URL</Badge>}
            >
              Search
            </SidebarItem>

            <SidebarItem
              active={currentPath === '/dashboard/settings'}
              icon={<Settings size={18} />}
              onClick={() => navigate({ to: '/dashboard/settings' })}
            >
              Settings
            </SidebarItem>
          </SidebarSection>
        </SidebarNav>

        <SidebarFooter>
          <Stack direction="column" gap={3}>
            <Stack direction="row" gap={2} align="center">
              <Avatar fallback="AD" size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" weight="medium">
                  Alex Developer
                </Text>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Text size="xs" color="secondary">
                    alex@example.com
                  </Text>
                </div>
              </div>
            </Stack>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: `1px solid ${colors.border.subtle}`,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/' })}
                aria-label="Back to Home"
              >
                <Stack direction="row" gap={1} align="center">
                  <Home size={14} />
                  <span>Home</span>
                </Stack>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMode}
                aria-label="Toggle theme"
              >
                {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </Button>
            </div>
          </Stack>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            height: '60px',
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
              Dashboard
            </Text>
            <Text size="sm" color="secondary">
              /
            </Text>
            <Text size="sm" weight="semibold">
              {currentPath === '/dashboard'
                ? 'Overview'
                : currentPath === '/dashboard/projects'
                ? 'Projects'
                : currentPath === '/dashboard/search'
                ? 'Search'
                : 'Settings'}
            </Text>
          </Stack>

          <Stack direction="row" gap={2} align="center">
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell size={16} />
            </Button>
            <Badge intent="success" size="sm">
              Live v0.1.0
            </Badge>
          </Stack>
        </div>

        {/* Nested Route Viewport */}
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
