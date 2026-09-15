import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Section } from './Section';

describe('Section', () => {
  it('renders section with title and description', () => {
    render(
      <Section title="My Section" description="Description text">
        <div>Content</div>
      </Section>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'My Section' })).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
