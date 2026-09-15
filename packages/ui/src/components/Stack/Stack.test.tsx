import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders children with flex layout', () => {
    render(
      <Stack data-testid="stack-element">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );
    const element = screen.getByTestId('stack-element');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyle({ display: 'flex', flexDirection: 'column' });
  });

  it('applies row direction when specified', () => {
    render(
      <Stack direction="row" data-testid="stack-element">
        <div>Item 1</div>
      </Stack>
    );
    expect(screen.getByTestId('stack-element')).toHaveStyle({ flexDirection: 'row' });
  });
});
