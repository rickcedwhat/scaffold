import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@scaffold/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

function createTestRouter(initialPath = '/') {
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

  return { router, queryClient };
}

function renderApp(initialPath = '/') {
  const { router, queryClient } = createTestRouter(initialPath);

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultMode="dark">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Scaffold Starter Application', () => {
  it('renders landing page at root route', async () => {
    renderApp('/');

    expect(await screen.findByText('Scaffold Starter')).toBeInTheDocument();
    expect(
      screen.getByText('The Architectural Foundation for Personal Software')
    ).toBeInTheDocument();
    expect(screen.getByText('TanStack Router')).toBeInTheDocument();
    expect(screen.getByText('TanStack Query')).toBeInTheDocument();
    expect(screen.getByText('Component Guardrails')).toBeInTheDocument();
  });

  it('renders dashboard overview with nested sidebar layout', async () => {
    renderApp('/dashboard');

    expect(await screen.findByText('Workspace Overview')).toBeInTheDocument();
    expect(screen.getByText('Alex Developer')).toBeInTheDocument();
    expect(screen.getByText('$128,450')).toBeInTheDocument();
    expect(screen.getByText('Recent Deployment Activity')).toBeInTheDocument();
  });

  it('navigates to settings and handles form saving', async () => {
    renderApp('/dashboard/settings');

    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Alex Developer');
    fireEvent.change(nameInput, { target: { value: 'Jordan Smith' } });
    expect(screen.getByDisplayValue('Jordan Smith')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText('Changes Saved!')).toBeInTheDocument();
  });

  it('validates email field and activates design system error state', async () => {
    renderApp('/dashboard/settings');

    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue('alex@example.com');

    // Type invalid email 'alex' and blur
    fireEvent.change(emailInput, { target: { value: 'alex' } });
    fireEvent.blur(emailInput);

    // Error helper text should appear with role="alert"
    const alertMessage = await screen.findByRole('alert');
    expect(alertMessage).toHaveTextContent('Please enter a valid email address');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Trying to submit while invalid should prevent saving
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(screen.queryByText('Changes Saved!')).not.toBeInTheDocument();

    // Fix the email to valid
    fireEvent.change(emailInput, { target: { value: 'alex@scaffold.dev' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');

    // Save should succeed now
    fireEvent.click(saveButton);
    expect(await screen.findByText('Changes Saved!')).toBeInTheDocument();
  });

  it('renders projects route with loader data and filters', async () => {
    renderApp('/dashboard/projects');

    expect(await screen.findByText('Projects & Workspaces')).toBeInTheDocument();
    expect(await screen.findByText('scaffold-core')).toBeInTheDocument();
    expect(screen.getByText('local-dev-dashboard')).toBeInTheDocument();

    // Click "In-progress" filter tab
    const inProgressTab = screen.getByRole('button', { name: /in-progress/i });
    fireEvent.click(inProgressTab);

    expect(screen.getByText('tanstack-router-starter')).toBeInTheDocument();
    expect(screen.queryByText('scaffold-core')).not.toBeInTheDocument();
  });
});
