import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PageShell, Container } from './PageShell';

describe('PageShell and Container', () => {
  it('renders page shell container with min-height', () => {
    render(<PageShell data-testid="shell">Shell Content</PageShell>);
    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });

  it('renders Container with maxWidth', () => {
    render(<Container maxWidth="lg" data-testid="container">Container Content</Container>);
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});
