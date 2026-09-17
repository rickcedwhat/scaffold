import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  TextInput,
  Button,
  useTheme,
} from '@scaffold/ui';
import { Search as SearchIcon, FileCode, Layers, Palette } from 'lucide-react';

interface SearchParams {
  q?: string;
  scope?: 'all' | 'components' | 'routes' | 'tokens';
}

export const Route = createFileRoute('/dashboard/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === 'string' ? search.q : '',
      scope:
        search.scope === 'components' ||
        search.scope === 'routes' ||
        search.scope === 'tokens'
          ? search.scope
          : 'all',
    };
  },
  component: SearchComponent,
});

const mockIndex = [
  {
    name: 'Button',
    type: 'components',
    desc: 'Interactive button primitive with variant, intent, and size props.',
    icon: <FileCode size={16} />,
  },
  {
    name: 'TextInput',
    type: 'components',
    desc: 'Encapsulated text input with floating border label and focus animation.',
    icon: <FileCode size={16} />,
  },
  {
    name: 'Dropdown',
    type: 'components',
    desc: 'Cross-platform styled select control with floating label and options.',
    icon: <FileCode size={16} />,
  },
  {
    name: 'Sidebar',
    type: 'components',
    desc: 'Hierarchical navigation layout primitive with polymorphic link items.',
    icon: <FileCode size={16} />,
  },
  {
    name: '/dashboard',
    type: 'routes',
    desc: 'Nested dashboard layout route with persistent sidebar and outlet.',
    icon: <Layers size={16} />,
  },
  {
    name: '/dashboard/projects',
    type: 'routes',
    desc: 'Route with TanStack Query loader prefetching and caching.',
    icon: <Layers size={16} />,
  },
  {
    name: '/dashboard/search',
    type: 'routes',
    desc: 'Type-safe search parameters synchronized with browser URL.',
    icon: <Layers size={16} />,
  },
  {
    name: 'colors.primary',
    type: 'tokens',
    desc: 'Semantic primary brand color (#2563eb / #3b82f6).',
    icon: <Palette size={16} />,
  },
  {
    name: 'radii.md',
    type: 'tokens',
    desc: 'Standard component border radius token (8px).',
    icon: <Palette size={16} />,
  },
];

function SearchComponent() {
  const { q = '', scope = 'all' } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { colors } = useTheme();

  const handleSearchChange = (val: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        q: val,
      }),
      replace: true,
    });
  };

  const handleScopeChange = (newScope: SearchParams['scope']) => {
    navigate({
      search: (prev) => ({
        ...prev,
        scope: newScope,
      }),
      replace: true,
    });
  };

  const results = mockIndex.filter((item) => {
    const matchesScope = scope === 'all' || item.type === scope;
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q.toLowerCase()) ||
      item.desc.toLowerCase().includes(q.toLowerCase());
    return matchesScope && matchesQuery;
  });

  return (
    <Stack direction="column" gap={6}>
      {/* Title & Description */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          Type-Safe Search
        </Heading>
        <Text size="sm" color="secondary">
          Parameters are validated through TanStack Router's <code style={{ fontSize: '12px' }}>validateSearch</code> schema and synced with the URL query string.
        </Text>
      </Stack>

      {/* Search Input Control */}
      <Card padding="normal">
        <Stack direction="column" gap={4}>
          <TextInput
            label="Search Index"
            placeholder="Type component, route, or token..."
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            prefixSlot={<SearchIcon size={16} color={colors.text.secondary} />}
            fullWidth
          />

          <Stack direction="row" gap={2} align="center">
            <Text size="xs" color="secondary" weight="medium">
              FILTER SCOPE:
            </Text>
            {(['all', 'components', 'routes', 'tokens'] as const).map((s) => (
              <Button
                key={s}
                variant={scope === s ? 'solid' : 'ghost'}
                intent={scope === s ? 'primary' : 'neutral'}
                size="sm"
                onClick={() => handleScopeChange(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Card>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size="sm" color="secondary">
          Showing {results.length} results {q ? `for "${q}"` : ''}
        </Text>
        <Badge intent="neutral" size="sm">
          URL: ?q={q || 'empty'}&amp;scope={scope}
        </Badge>
      </div>

      {/* Results List */}
      <Stack direction="column" gap={3}>
        {results.length === 0 ? (
          <Card padding="normal" variant="subtle">
            <Stack direction="column" gap={2} align="center">
              <Text size="base" weight="medium">
                No matches found
              </Text>
              <Text size="sm" color="secondary">
                Try searching for "Button", "dashboard", or "colors".
              </Text>
            </Stack>
          </Card>
        ) : (
          results.map((item) => (
            <Card key={item.name} padding="compact">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" gap={3} align="center">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: colors.bg.subtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.intent.primary.main,
                    }}
                  >
                    {item.icon}
                  </div>

                  <Stack direction="column" gap={1}>
                    <Text size="sm" weight="semibold">
                      {item.name}
                    </Text>
                    <Text size="xs" color="secondary">
                      {item.desc}
                    </Text>
                  </Stack>
                </Stack>

                <Badge
                  intent={
                    item.type === 'components'
                      ? 'primary'
                      : item.type === 'routes'
                      ? 'success'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {item.type}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}
