import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { TextInput } from './Input';

describe('TextInput / Input', () => {
  it('renders input with placeholder correctly', () => {
    render(<TextInput placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('renders integrated label and helper text', () => {
    render(
      <TextInput
        label="Username"
        helperText="Must be unique."
        placeholder="e.g. jdoe"
      />
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Must be unique.')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<TextInput placeholder="Enter text" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput ref={ref} placeholder="With ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles disabled state', () => {
    render(<TextInput placeholder="Disabled input" disabled />);
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
  });

  it('reflects error state via aria-invalid and alert role', () => {
    render(<TextInput label="Email" error helperText="Invalid email address" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
  });

  it('supports isDirty feedback state', () => {
    render(<TextInput label="First Name" isDirty defaultValue="Modified Value" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Modified Value');
  });

  it('renders prefix and suffix slots', () => {
    render(
      <TextInput
        placeholder="With slots"
        prefixSlot={<span data-testid="prefix-icon">$</span>}
        suffixSlot={<span data-testid="suffix-icon">USD</span>}
      />
    );
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('defaults to fullWidth = false with 320px container width', () => {
    const { container } = render(<TextInput placeholder="Test" />);
    expect(container.firstElementChild).toHaveStyle({ width: '320px' });
  });

  it('supports fullWidth = true with 100% container width', () => {
    const { container } = render(<TextInput placeholder="Test" fullWidth />);
    expect(container.firstElementChild).toHaveStyle({ width: '100%' });
  });
});
