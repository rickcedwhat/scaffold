import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@scaffold/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

function renderTemplateApp(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const history = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history,
    context: {
      queryClient,
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultMode="dark">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Scaffold Template Application', () => {
  it('renders minimal landing page', async () => {
    renderTemplateApp('/');

    expect(await screen.findByText('Scaffold App')).toBeInTheDocument();
    expect(
      screen.getByText('Ready to Build Your Product')
    ).toBeInTheDocument();
    expect(screen.getByText('1. Add Routes')).toBeInTheDocument();
    expect(screen.getByText('2. Use UI Primitives')).toBeInTheDocument();
  });

  it('renders blank canvas dashboard layout', async () => {
    renderTemplateApp('/app');

    expect(await screen.findByText('Dashboard Canvas')).toBeInTheDocument();
    expect(screen.getByText('Start Building Here')).toBeInTheDocument();
    expect(screen.getByText('Ready for feature development')).toBeInTheDocument();
  });
});
