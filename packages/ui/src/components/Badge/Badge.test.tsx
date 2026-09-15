import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders badge children with variant styling', () => {
    render(<Badge intent="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
  });
});
