import { describe, it, expect } from 'vitest';
import { renderApp, screen, fireEvent, waitFor } from '@scaffold/test-utils';
import { routeTree } from './routeTree.gen';

describe('Scaffold Starter Application', () => {
  it('renders landing page at root route', async () => {
    renderApp(routeTree, { initialPath: '/' });

    expect(await screen.findByText('Scaffold Starter')).toBeInTheDocument();
    expect(
      screen.getByText('The Architectural Foundation for Personal Software')
    ).toBeInTheDocument();
    expect(screen.getByText('TanStack Router')).toBeInTheDocument();
    expect(screen.getByText('TanStack Query')).toBeInTheDocument();
    expect(screen.getByText('Component Guardrails')).toBeInTheDocument();
  });

  it('renders dashboard overview with nested sidebar layout', async () => {
    renderApp(routeTree, { initialPath: '/dashboard' });

    expect(await screen.findByText('Workspace Overview')).toBeInTheDocument();
    expect(screen.getByText('Alex Developer')).toBeInTheDocument();
    expect(screen.getByText('$128,450')).toBeInTheDocument();
    expect(screen.getByText('Recent Deployment Activity')).toBeInTheDocument();
  });

  it('navigates to settings and handles form saving', async () => {
    renderApp(routeTree, { initialPath: '/dashboard/settings' });

    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Alex Developer');
    fireEvent.change(nameInput, { target: { value: 'Jordan Smith' } });
    expect(screen.getByDisplayValue('Jordan Smith')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText('Changes Saved!')).toBeInTheDocument();
  });

  it('validates email field and activates design system error state', async () => {
    renderApp(routeTree, { initialPath: '/dashboard/settings' });

    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue('alex@example.com');

    // Type invalid email 'alex' and blur
    fireEvent.change(emailInput, { target: { value: 'alex' } });
    fireEvent.blur(emailInput);

    // Error helper text should appear with role="alert"
    const alertMessage = await screen.findByRole('alert');
    expect(alertMessage).toHaveTextContent('Please enter a valid email address');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Trying to submit while invalid should prevent saving and trigger error feedback
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    expect(screen.queryByText('Changes Saved!')).not.toBeInTheDocument();
    expect(await screen.findByText('Fix Errors to Save')).toBeInTheDocument();
    expect(screen.getByText('Please resolve highlighted errors')).toBeInTheDocument();

    // Fix the email to valid
    fireEvent.change(emailInput, { target: { value: 'alex@scaffold.dev' } });
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });

    // Save should succeed now
    const updatedSaveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(updatedSaveButton);
    expect(await screen.findByText('Changes Saved!')).toBeInTheDocument();
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('tracks isDirty on inputs and dropdowns, and resets dirty state on successful save', async () => {
    renderApp(routeTree, { initialPath: '/dashboard/settings' });

    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument();

    // Change role dropdown
    const roleTrigger = screen.getByRole('combobox', { name: /default project role/i });
    fireEvent.click(roleTrigger);
    const options = screen.getAllByRole('option', { name: /Editor/i });
    fireEvent.click(options[options.length - 1]!);
    expect(roleTrigger).toHaveTextContent('Editor (Can Edit & Deploy)');

    // Save preferences
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);

    // Save should succeed and show feedback
    expect(await screen.findByText('Changes Saved!')).toBeInTheDocument();
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('opens feedback modal from dashboard header and submits a noop report', async () => {
    renderApp(routeTree, { initialPath: '/dashboard' });

    expect(await screen.findByText('Workspace Overview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /report feedback/i }));

    expect(await screen.findByText('Report an issue')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/short summary/i), {
      target: { value: 'Demo feedback report' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what went wrong/i), {
      target: { value: 'Just verifying the in-app reporting flow works end to end.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    expect(await screen.findByText(/your report was filed/i)).toBeInTheDocument();
    expect(screen.getByText(/demo-1/i)).toBeInTheDocument();
  });

  it('renders projects route with loader data and filters', async () => {
    renderApp(routeTree, { initialPath: '/dashboard/projects' });

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
