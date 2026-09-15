import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders fallback text with uppercase initials', () => {
    render(<Avatar fallback="sc" />);
    const avatar = screen.getByRole('img', { name: /avatar/i });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('SC');
  });
});
