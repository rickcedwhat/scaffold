import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Header } from './Header';

describe('Header', () => {
  it('renders children inside a <header> element', () => {
    render(<Header><span>Logo</span></Header>);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('defaults to non-sticky positioning', () => {
    render(<Header><span>title</span></Header>);
    const header = document.querySelector('header') as HTMLElement;
    expect(header.style.position).toBe('relative');
  });

  it('applies sticky positioning when sticky=true', () => {
    render(<Header sticky><span>title</span></Header>);
    const header = document.querySelector('header') as HTMLElement;
    expect(header.style.position).toBe('sticky');
    expect(header.style.top).toBe('0px');
  });

  it('forwards extra HTML attributes', () => {
    render(<Header data-testid="main-header"><span>nav</span></Header>);
    expect(screen.getByTestId('main-header')).toBeInTheDocument();
  });
});
