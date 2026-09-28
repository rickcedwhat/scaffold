import { describe, it, expect } from 'vitest';
import { renderApp, screen, fireEvent } from '@scaffold/test-utils';
import { routeTree } from './routeTree.gen';

describe('Settings form', () => {
  it('blocks invalid input and saves valid settings', async () => {
    renderApp(routeTree, { initialPath: '/app/settings' });

    const save = await screen.findByRole('button', { name: /save settings/i });
    fireEvent.click(save);
    expect(await screen.findByText('Display name is required.')).toBeInTheDocument();
    expect(screen.queryByText('Settings saved')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Alex Developer' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.click(save);

    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
  });
});
