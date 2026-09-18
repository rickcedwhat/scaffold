import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { StatusIllustration } from './StatusIllustration';

vi.mock('lottie-react', () => {
  throw new Error('Failed to load lottie-react');
});

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
        fallback={<div>Custom Graphic</div>}
      />
    );
    expect(screen.getByText('Custom Graphic')).toBeInTheDocument();
  });

  it('renders fallback when lazy Lottie fails to load', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StatusIllustration
        animationData={{ v: '5.5.7' }}
        fallback={<div>Animation Failed Fallback</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Animation Failed Fallback')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
