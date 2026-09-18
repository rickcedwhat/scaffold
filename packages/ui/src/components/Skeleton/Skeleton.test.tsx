import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with status role and aria-busy by default', () => {
    render(<Skeleton />);
    const el = screen.getByRole('status');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders custom aria-label', () => {
    render(<Skeleton aria-label="Loading profile..." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading profile...');
  });

  it('renders circular variant with specified dimensions', () => {
    render(<Skeleton variant="circular" width={48} height={48} aria-label="Avatar skeleton" />);
    const el = screen.getByRole('status');
    expect(el).toHaveStyle({
      width: '48px',
      height: '48px',
      borderRadius: '9999px',
    });
  });

  it('renders multi-line text skeleton', () => {
    render(<Skeleton variant="text" lines={3} aria-label="Article body" />);
    const parent = screen.getByRole('status');
    expect(parent).toBeInTheDocument();

    const lines = parent.children;
    expect(lines).toHaveLength(3);
    // Last line should have width 65%
    expect(lines[2]).toHaveStyle({ width: '65%' });
  });

  it('supports wave and none animation modes without errors', () => {
    const { rerender } = render(<Skeleton animation="wave" aria-label="Wave skeleton" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Skeleton animation="none" aria-label="Static skeleton" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders rectangular and rounded variants with default token dimensions and supports overrides', () => {
    const { rerender } = render(<Skeleton variant="rectangular" aria-label="Card skeleton" />);
    const cardEl = screen.getByRole('status');
    expect(cardEl).toHaveStyle({
      height: '3rem',
      borderRadius: '0px',
    });

    rerender(<Skeleton variant="rounded" height={120} aria-label="Banner skeleton" />);
    const bannerEl = screen.getByRole('status');
    expect(bannerEl).toHaveStyle({
      height: '120px',
      borderRadius: '12px',
    });
  });
});
