/**
 * @scaffold/test-utils
 *
 * Shared testing utilities for Scaffold apps. Eliminates duplicated
 * QueryClient + ThemeProvider + Router boilerplate across test files.
 *
 * Usage — component/unit tests (no router needed):
 *   import { renderWithProviders, screen } from '@scaffold/test-utils';
 *   renderWithProviders(<MyComponent />);
 *
 * Usage — full app integration tests (with router):
 *   import { renderApp, screen } from '@scaffold/test-utils';
 *   import { routeTree } from './routeTree.gen';
 *   renderApp(routeTree, '/dashboard');
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRouter,
  createMemoryHistory,
  RouterProvider,
  type AnyRoute,
  type AnyRouter,
} from '@tanstack/react-router';
import { ThemeProvider } from '@scaffold/ui';

// ─── Re-exports ───────────────────────────────────────────────────────────────
// One import to rule them all — consumers don't need @testing-library/react directly.
export {
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  getDefaultNormalizer,
} from '@testing-library/react';
export { render };
export type { RenderResult };

// ─── Default test QueryClient factory ────────────────────────────────────────
/**
 * Creates a QueryClient tuned for tests:
 * - retries disabled (failures surface immediately)
 * - no caching between tests (gcTime: 0)
 * - logger silenced in tests
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ─── renderWithProviders ──────────────────────────────────────────────────────
export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Pre-built QueryClient. Defaults to a fresh test-tuned client. */
  queryClient?: QueryClient;
  /** Default theme mode. Defaults to 'light'. */
  themeMode?: 'light' | 'dark';
}

/**
 * Renders a React element wrapped in QueryClientProvider + ThemeProvider.
 * Use this for unit/component tests that don't need a router.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    themeMode = 'light',
    ...renderOptions
  }: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultMode={themeMode}>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// ─── createTestApp ────────────────────────────────────────────────────────────
export interface CreateTestAppOptions {
  /** Initial URL path. Defaults to '/'. */
  initialPath?: string;
  /** Extra router context beyond queryClient. */
  context?: Record<string, unknown>;
  /** Pre-built QueryClient. Defaults to a fresh test-tuned client. */
  queryClient?: QueryClient;
}

/**
 * Creates a router wired to a memory history and a test QueryClient.
 * Use when you need access to router or queryClient directly.
 */
export function createTestApp<TRoute extends AnyRoute>(
  routeTree: TRoute,
  {
    initialPath = '/',
    context = {},
    queryClient = createTestQueryClient(),
  }: CreateTestAppOptions = {}
): { router: AnyRouter; queryClient: QueryClient } {
  const history = createMemoryHistory({ initialEntries: [initialPath] });

  const router = createRouter({
    routeTree,
    history,
    context: { queryClient, ...context },
  });

  return { router, queryClient };
}

// ─── renderApp ────────────────────────────────────────────────────────────────
export interface RenderAppOptions extends CreateTestAppOptions {
  /** Default theme mode. Defaults to 'light'. */
  themeMode?: 'light' | 'dark';
}

/**
 * Full one-liner for app-layer integration tests.
 * Creates QueryClient + memory router + renders wrapped in providers.
 *
 * @example
 * import { renderApp, screen } from '@scaffold/test-utils';
 * import { routeTree } from './routeTree.gen';
 *
 * renderApp(routeTree, { initialPath: '/dashboard' });
 * expect(await screen.findByText('Overview')).toBeInTheDocument();
 */
export function renderApp<TRoute extends AnyRoute>(
  routeTree: TRoute,
  {
    initialPath = '/',
    themeMode = 'light',
    context = {},
    queryClient = createTestQueryClient(),
  }: RenderAppOptions = {}
): RenderResult & { router: AnyRouter; queryClient: QueryClient } {
  const { router } = createTestApp(routeTree, { initialPath, context, queryClient });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultMode={themeMode}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );

  return { ...result, router, queryClient };
}
