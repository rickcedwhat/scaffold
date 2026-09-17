import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from './Sidebar';

describe('Sidebar', () => {
  it('renders sidebar structure with header, sections, items, and footer', () => {
    render(
      <Sidebar>
        <SidebarHeader>
          <span data-testid="header-content">Brand</span>
        </SidebarHeader>
        <SidebarNav>
          <SidebarSection title="Components">
            <SidebarItem active>Buttons</SidebarItem>
            <SidebarItem href="/forms">Forms</SidebarItem>
          </SidebarSection>
        </SidebarNav>
        <SidebarFooter>
          <span data-testid="footer-content">Footer</span>
        </SidebarFooter>
      </Sidebar>
    );

    expect(screen.getByTestId('header-content')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Buttons')).toBeInTheDocument();
    expect(screen.getByText('Forms')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
  });

  it('renders as anchor link when href is supplied', () => {
    render(<SidebarItem href="/dashboard">Dashboard</SidebarItem>);
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders as button when as="button" or no href is provided', () => {
    render(<SidebarItem as="button">Settings</SidebarItem>);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('marks active item with aria-current="page"', () => {
    render(
      <SidebarItem active href="/active-page">
        Active Item
      </SidebarItem>
    );
    const link = screen.getByRole('link', { name: /active item/i });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders icon and badge slots', () => {
    render(
      <SidebarItem
        icon={<span data-testid="item-icon">⚙️</span>}
        badge={<span data-testid="item-badge">New</span>}
      >
        Tools
      </SidebarItem>
    );
    expect(screen.getByTestId('item-icon')).toBeInTheDocument();
    expect(screen.getByTestId('item-badge')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('handles click events on button items', () => {
    const handleClick = vi.fn();
    render(<SidebarItem onClick={handleClick}>Clickable</SidebarItem>);
    fireEvent.click(screen.getByRole('button', { name: /clickable/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
