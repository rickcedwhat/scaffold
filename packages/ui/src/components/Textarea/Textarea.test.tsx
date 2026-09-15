import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createRef } from 'react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea correctly with placeholder', () => {
    render(<Textarea placeholder="Enter your feedback" />);
    expect(screen.getByPlaceholderText('Enter your feedback')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea placeholder="Type here" onChange={handleChange} />);
    const textarea = screen.getByPlaceholderText('Type here');
    fireEvent.change(textarea, { target: { value: 'Multiline text\nSecond line' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to HTMLTextAreaElement', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('handles disabled state', () => {
    render(<Textarea placeholder="Disabled textarea" disabled />);
    expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled();
  });

  it('reflects error state via aria-invalid', () => {
    render(<Textarea placeholder="Error textarea" hasError />);
    expect(screen.getByPlaceholderText('Error textarea')).toHaveAttribute('aria-invalid', 'true');
  });
});
