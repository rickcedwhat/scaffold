import { describe, it, expect } from 'vitest';
import { renderApp, screen } from '@scaffold/test-utils';
import { routeTree } from './routeTree.gen';

describe('Scaffold Template Application', () => {
  it('renders minimal landing page', async () => {
    renderApp(routeTree, { initialPath: '/' });

    expect(await screen.findByText('Scaffold App')).toBeInTheDocument();
    expect(
      screen.getByText('Ready to Build Your Product')
    ).toBeInTheDocument();
    expect(screen.getByText('1. Add Routes')).toBeInTheDocument();
    expect(screen.getByText('2. Use UI Primitives')).toBeInTheDocument();
  });

  it('renders blank canvas dashboard layout', async () => {
    renderApp(routeTree, { initialPath: '/app' });

    expect(await screen.findByText('Dashboard Canvas')).toBeInTheDocument();
    expect(screen.getByText('Start Building Here')).toBeInTheDocument();
    expect(screen.getByText('Ready for feature development')).toBeInTheDocument();
  });
});
