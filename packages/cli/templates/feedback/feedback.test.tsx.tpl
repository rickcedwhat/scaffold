import { describe, it, expect } from 'vitest';
import { renderApp, screen, fireEvent } from '@scaffold/test-utils';
import { routeTree } from './routeTree.gen';

describe('Feedback widget', () => {
  it('files a report through the configured adapter', async () => {
    renderApp(routeTree, { initialPath: '/app' });

    fireEvent.click(await screen.findByRole('button', { name: /report an issue/i }));
    fireEvent.change(await screen.findByPlaceholderText(/short summary/i), {
      target: { value: 'Something broke' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what went wrong/i), {
      target: { value: 'Steps to reproduce the problem in detail.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    expect(await screen.findByText(/your report was filed/i)).toBeInTheDocument();
  });
});
