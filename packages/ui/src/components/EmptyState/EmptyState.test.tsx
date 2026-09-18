import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your filter or search query."
      />
    );

    expect(screen.getByRole('region', { name: 'No items found' })).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filter or search query.')).toBeInTheDocument();
  });

  it('renders action buttons when provided', () => {
    render(
      <EmptyState
        title="Empty Projects"
        action={<Button intent="primary">Create Project</Button>}
        secondaryAction={<Button variant="ghost">Import Repo</Button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import Repo' })).toBeInTheDocument();
  });

  it('renders preset illustration by default', () => {
    render(<EmptyState preset="search" title="Zero results" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('supports custom illustration slot', () => {
    render(
      <EmptyState
        illustration={<span data-testid="custom-art">Custom Art</span>}
        title="Custom State"
      />
    );

    expect(screen.getByTestId('custom-art')).toBeInTheDocument();
  });

  it('supports horizontal layout and bordered mode', () => {
    const { container } = render(
      <EmptyState
        layout="horizontal"
        bordered
        title="Compact Banner"
        description="Inline status notification."
      />
    );

    const region = container.firstElementChild as HTMLElement;
    expect(region).toHaveStyle({
      flexDirection: 'row',
    });
  });
});
