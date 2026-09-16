import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createRef } from 'react';
import { Dropdown, Select } from './Select';

describe('Dropdown / Select', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true },
  ];

  it('renders select with options array and integrated label', () => {
    render(
      <Dropdown
        label="Select Item"
        helperText="Choose an option"
        options={options}
        data-testid="test-select"
      />
    );
    expect(screen.getByText('Select Item')).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeDisabled();
  });

  it('renders select with children options', () => {
    render(
      <Dropdown data-testid="custom-select">
        <option value="a">A</option>
        <option value="b">B</option>
      </Dropdown>
    );
    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Dropdown options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to HTMLSelectElement', () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Dropdown ref={ref} options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('handles disabled state', () => {
    render(<Dropdown options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('reflects error state via aria-invalid', () => {
    render(<Dropdown options={options} error helperText="Field required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Field required');
  });

  it('supports isDirty modification state', () => {
    render(<Dropdown options={options} isDirty defaultValue="1" />);
    expect(screen.getByRole('combobox')).toHaveValue('1');
  });
});
