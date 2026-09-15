import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Text } from './Text';

describe('Text', () => {
  it('renders paragraph text by default', () => {
    render(<Text>Paragraph content</Text>);
    const element = screen.getByText('Paragraph content');
    expect(element.tagName).toBe('P');
  });

  it('renders as span when requested', () => {
    render(<Text as="span">Span content</Text>);
    const element = screen.getByText('Span content');
    expect(element.tagName).toBe('SPAN');
  });
});
