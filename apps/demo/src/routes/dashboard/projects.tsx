import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, queryOptions } from '@tanstack/react-query';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  Grid,
  Button,
  useTheme,
} from '@scaffold/ui';
import { FolderKanban, GitBranch, Users, RefreshCw } from 'lucide-react';

export interface ProjectItem {
  id: string;
  name: string;
  repo: string;
  status: 'active' | 'in-progress' | 'completed';
  category: string;
  updatedAt: string;
  contributors: number;
}

const mockProjects: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'scaffold-core',
    repo: 'rickcedwhat/scaffold',
    status: 'active',
    category: 'Architecture',
    updatedAt: '10m ago',
    contributors: 3,
  },
  {
    id: 'proj-2',
    name: 'local-dev-dashboard',
    repo: 'rickcedwhat/local-dev-dashboard',
    status: 'active',
    category: 'Tooling',
    updatedAt: '2h ago',
    contributors: 2,
  },
  {
    id: 'proj-3',
    name: 'tanstack-router-starter',
    repo: 'rickcedwhat/scaffold',
    status: 'in-progress',
    category: 'Application',
    updatedAt: 'Just now',
    contributors: 1,
  },
  {
    id: 'proj-4',
    name: 'eslint-guardrails-plugin',
    repo: 'rickcedwhat/scaffold',
    status: 'completed',
    category: 'Linting',
    updatedAt: '14h ago',
    contributors: 2,
  },
];

export const projectsQueryOptions = queryOptions({
  queryKey: ['projects'],
  queryFn: async (): Promise<ProjectItem[]> => {
    // Simulate brief network delay for loader demo
    await new Promise((res) => setTimeout(res, 50));
    return mockProjects;
  },
});

export const Route = createFileRoute('/dashboard/projects')({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsComponent,
});

function ProjectsComponent() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'active' | 'in-progress' | 'completed'>('all');

  const { data: projects = [], refetch, isFetching } = useQuery(projectsQueryOptions);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <Stack direction="column" gap={6}>
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="column" gap={1}>
          <Heading level={2} size="xl">
            Projects &amp; Workspaces
          </Heading>
          <Text size="sm" color="secondary">
            Loaded via TanStack Router route loader with TanStack Query caching.
          </Text>
        </Stack>

        <Button
          variant="outline"
          intent="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <Stack direction="row" gap={1} align="center">
            <RefreshCw
              size={14}
              style={{
                animation: isFetching ? 'scaffold-spin 1s linear infinite' : 'none',
              }}
            />
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </Stack>
        </Button>
      </div>

      {/* Filter Tabs */}
      <Stack direction="row" gap={2} align="center">
        {(['all', 'active', 'in-progress', 'completed'] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'solid' : 'ghost'}
            intent={filter === tab ? 'primary' : 'neutral'}
            size="sm"
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </Stack>

      {/* Projects Grid */}
      <Grid minItemWidth="320px" gap={4}>
        {filtered.map((project) => (
          <Card key={project.id} padding="normal">
            <Stack direction="column" gap={3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" gap={2} align="center">
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
                    <FolderKanban size={18} />
                  </div>
                  <Stack direction="column" gap={1}>
                    <Heading level={4} size="base">
                      {project.name}
                    </Heading>
                    <Text size="xs" color="secondary">
                      {project.category}
                    </Text>
                  </Stack>
                </Stack>

                <Badge
                  intent={
                    project.status === 'active'
                      ? 'success'
                      : project.status === 'in-progress'
                      ? 'primary'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {project.status}
                </Badge>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${colors.border.subtle}`,
                }}
              >
                <Stack direction="row" gap={3} align="center">
                  <Stack direction="row" gap={1} align="center">
                    <GitBranch size={13} color={colors.text.secondary} />
                    <Text size="xs" color="secondary">
                      {project.repo}
                    </Text>
                  </Stack>

                  <Stack direction="row" gap={1} align="center">
                    <Users size={13} color={colors.text.secondary} />
                    <Text size="xs" color="secondary">
                      {project.contributors}
                    </Text>
                  </Stack>
                </Stack>

                <Text size="xs" color="secondary">
                  {project.updatedAt}
                </Text>
              </div>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
