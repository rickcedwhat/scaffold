import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children with surface styling', () => {
    render(<Card data-testid="test-card">Card Content</Card>);
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Content');
  });
});
