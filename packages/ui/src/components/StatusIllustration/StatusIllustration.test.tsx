import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusIllustration } from './StatusIllustration';

describe('StatusIllustration', () => {
  it('renders default empty preset with image role and aria-label', () => {
    render(<StatusIllustration />);
    const el = screen.getByRole('img');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'empty illustration');
  });

  it('renders all supported presets', () => {
    const presets = ['search', 'empty', 'not-found', 'error', 'success'] as const;

    for (const preset of presets) {
      const { unmount } = render(<StatusIllustration preset={preset} aria-label={`${preset} test`} />);
      expect(screen.getByRole('img', { name: `${preset} test` })).toBeInTheDocument();
      unmount();
    }
  });

  it('applies tokenized size dimensions', () => {
    const { rerender } = render(<StatusIllustration size="sm" aria-label="Small" />);
    expect(screen.getByRole('img')).toHaveStyle({ width: '80px', height: '80px' });

    rerender(<StatusIllustration size="lg" aria-label="Large" />);
    expect(screen.getByRole('img')).toHaveStyle({ width: '160px', height: '160px' });
  });

  it('renders custom fallback element when provided', () => {
    render(
      <StatusIllustration
        fallback={<div data-testid="custom-vector">Custom Graphic</div>}
      />
    );
    expect(screen.getByTestId('custom-vector')).toHaveTextContent('Custom Graphic');
  });
});
