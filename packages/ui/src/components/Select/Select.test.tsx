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
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();

    // Open dropdown menu
    fireEvent.click(combobox);
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders select with children options', () => {
    render(
      <Dropdown data-testid="custom-select">
        <option value="a">A</option>
        <option value="b">B</option>
      </Dropdown>
    );
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('handles value changes when an option is selected', () => {
    const handleChange = vi.fn();
    render(<Dropdown options={options} onChange={handleChange} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const option2 = screen.getByRole('option', { name: 'Option 2' });
    fireEvent.click(option2);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      target: { value: '2', name: undefined },
    });
    expect(combobox).toHaveTextContent('Option 2');
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

  it('supports isDirty modification state and displays defaultValue label', () => {
    render(<Dropdown options={options} isDirty defaultValue="1" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');
  });

  it('defaults to fullWidth = false with 320px width', () => {
    const { container } = render(<Dropdown options={options} />);
    expect(container.firstElementChild).toHaveStyle({ width: '320px' });
  });

  it('supports fullWidth = true with 100% width', () => {
    const { container } = render(<Dropdown options={options} fullWidth />);
    expect(container.firstElementChild).toHaveStyle({ width: '100%' });
  });
});
