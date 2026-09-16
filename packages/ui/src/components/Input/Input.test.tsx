import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createRef } from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element correctly', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Enter text" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="With ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles disabled state', () => {
    render(<Input placeholder="Disabled input" disabled />);
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
  });

  it('reflects error state via aria-invalid', () => {
    render(<Input placeholder="Error input" hasError />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders prefix and suffix slots', () => {
    render(
      <Input
        placeholder="With slots"
        prefixSlot={<span data-testid="prefix-icon">$</span>}
        suffixSlot={<span data-testid="suffix-icon">USD</span>}
      />
    );
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });
});
