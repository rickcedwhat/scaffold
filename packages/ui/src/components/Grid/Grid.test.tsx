import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid>
        <div data-testid="child-a">A</div>
        <div data-testid="child-b">B</div>
      </Grid>
    );
    expect(screen.getByTestId('child-a')).toBeInTheDocument();
    expect(screen.getByTestId('child-b')).toBeInTheDocument();
  });

  it('applies CSS grid layout', () => {
    const { container } = render(<Grid><div>item</div></Grid>);
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.display).toBe('grid');
    expect(grid.style.width).toBe('100%');
  });

  it('uses minItemWidth to set gridTemplateColumns', () => {
    const { container } = render(<Grid minItemWidth="320px"><div>item</div></Grid>);
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain('320px');
  });

  it('accepts numeric minItemWidth and converts to px', () => {
    const { container } = render(<Grid minItemWidth={240}><div>item</div></Grid>);
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain('240px');
  });
});
