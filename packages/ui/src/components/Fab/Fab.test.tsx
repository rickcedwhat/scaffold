import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeContext';
import { Fab, type FabActionItem } from './Fab';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

const mockActions: FabActionItem[] = [
  {
    id: 'create',
    label: 'Create Project',
    icon: <span data-testid="icon-create">+</span>,
    onClick: vi.fn(),
  },
  {
    id: 'upload',
    label: 'Upload Asset',
    icon: <span data-testid="icon-upload">^</span>,
    onClick: vi.fn(),
  },
  {
    id: 'share',
    label: 'Share Workspace',
    icon: <span data-testid="icon-share">&gt;</span>,
    onClick: vi.fn(),
    disabled: true,
  },
];

describe('Fab (Floating Action Button)', () => {
  it('renders single-action FAB and triggers onClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Fab
        label="Quick Action"
        icon={<span data-testid="fab-icon">★</span>}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Quick Action' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('fab-icon')).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders indicator badge when badge prop is provided', () => {
    const { rerender } = renderWithTheme(
      <Fab
        label="Messages"
        icon={<span>✉</span>}
        badge={5}
      />
    );

    expect(screen.getByTestId('scaffold-fab-badge')).toHaveTextContent('5');

    // Dot badge when badge={true}
    rerender(
      <ThemeProvider>
        <Fab label="Messages" icon={<span>✉</span>} badge={true} />
      </ThemeProvider>
    );
    expect(screen.getByTestId('scaffold-fab-badge')).toHaveTextContent('');
  });

  it('toggles speed-dial action menu on click', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Fab
        label="Speed Dial Actions"
        icon={<span>⚡</span>}
        actions={mockActions}
        onOpenChange={onOpenChange}
      />
    );

    const button = screen.getByRole('button', { name: 'Speed Dial Actions' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Verify sub-actions are visible and have accessible labels
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Upload Asset')).toBeInTheDocument();

    // Click sub-action
    const createBtn = screen.getByRole('menuitem', { name: 'Create Project' });
    fireEvent.click(createBtn);
    expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);

    // Menu closes after action click
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports controlled open and onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = renderWithTheme(
      <Fab
        label="Controlled FAB"
        icon={<span>⚡</span>}
        actions={mockActions}
        open={false}
        onOpenChange={onOpenChange}
      />
    );

    const button = screen.getByRole('button', { name: 'Controlled FAB' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Rerender with open={true}
    rerender(
      <ThemeProvider>
        <Fab
          label="Controlled FAB"
          icon={<span>⚡</span>}
          actions={mockActions}
          open={true}
          onOpenChange={onOpenChange}
        />
      </ThemeProvider>
    );
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes speed-dial menu when Escape key is pressed', () => {
    renderWithTheme(
      <Fab
        label="Escape Test"
        icon={<span>⚡</span>}
        actions={mockActions}
        defaultOpen={true}
      />
    );

    const button = screen.getByRole('button', { name: 'Escape Test' });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Focus a sub-action menu item
    const firstItem = screen.getByRole('menuitem', { name: 'Create Project' });
    firstItem.focus();
    expect(firstItem).toHaveFocus();

    // Escape closes menu and restores focus to the main button trigger
    fireEvent.keyDown(firstItem, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('closes speed-dial menu on pointerdown outside', () => {
    renderWithTheme(
      <div>
        <div data-testid="outside-element">Outside</div>
        <Fab
          label="Outside Click Test"
          icon={<span>⚡</span>}
          actions={mockActions}
          defaultOpen={true}
        />
      </div>
    );

    const button = screen.getByRole('button', { name: 'Outside Click Test' });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerDown(screen.getByTestId('outside-element'));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates sub-actions via arrow keys', () => {
    renderWithTheme(
      <Fab
        label="Keyboard Navigation"
        icon={<span>⚡</span>}
        actions={mockActions}
        defaultOpen={true}
      />
    );

    const root = screen.getByTestId('scaffold-fab-root');
    const menuItems = screen.getAllByRole('menuitem');

    // Focus first item
    menuItems[0].focus();
    expect(menuItems[0]).toHaveFocus();

    // ArrowDown moves to second item
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(menuItems[1]).toHaveFocus();

    // ArrowUp moves back to first item
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    expect(menuItems[0]).toHaveFocus();

    // End key moves to last enabled item (skipping disabled share action)
    fireEvent.keyDown(root, { key: 'End' });
    expect(menuItems[1]).toHaveFocus();

    // Home key moves back to first item
    fireEvent.keyDown(root, { key: 'Home' });
    expect(menuItems[0]).toHaveFocus();
  });

  it('recalculates implicit menu direction dynamically after dragging', () => {
    renderWithTheme(
      <Fab
        label="Direction Test"
        icon={<span>★</span>}
        actions={mockActions}
        placement="bottom-right"
        draggable={true}
        defaultOpen={true}
      />
    );

    const menuContainer = screen.getByRole('menu');
    expect(menuContainer.style.bottom).toBe('66px');

    // Dragged towards top of viewport (y = 50px < window.innerHeight / 2)
    const button = screen.getByRole('button', { name: 'Direction Test' });
    button.setPointerCapture = vi.fn();
    button.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(button, { clientX: 100, clientY: 500, pointerId: 1 });
    fireEvent.pointerMove(button, { clientX: 100, clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(button, { clientX: 100, clientY: 50, pointerId: 1 });

    // When dragged to top half, implicit direction recalculates to 'down'
    expect(menuContainer.style.top).toBe('66px');
  });

  it('does not fire action on disabled sub-actions', () => {
    renderWithTheme(
      <Fab
        label="Disabled Action Test"
        icon={<span>⚡</span>}
        actions={mockActions}
        defaultOpen={true}
      />
    );

    const disabledBtn = screen.getByRole('menuitem', { name: 'Share Workspace' });
    expect(disabledBtn).toBeDisabled();

    fireEvent.click(disabledBtn);
    expect(mockActions[2].onClick).not.toHaveBeenCalled();
  });

  it('discriminates between drag and click when draggable is enabled', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Fab
        label="Draggable FAB"
        icon={<span>★</span>}
        draggable={true}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Draggable FAB' });

    // Mock setPointerCapture and releasePointerCapture
    button.setPointerCapture = vi.fn();
    button.releasePointerCapture = vi.fn();

    // 1. Regular click without moving pointer should fire onClick
    fireEvent.pointerDown(button, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(button, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // 2. Drag operation: movement > 5px should NOT fire onClick
    fireEvent.pointerDown(button, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(button, { clientX: 140, clientY: 140, pointerId: 1 });
    fireEvent.pointerUp(button, { clientX: 140, clientY: 140, pointerId: 1 });
    fireEvent.click(button);

    // Still 1, not incremented because drag suppressed the click
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('generates unique label IDs across multiple Fab instances', () => {
    const actions1 = [{ id: 'action-1', label: 'First Action', icon: <span>1</span> }];
    const actions2 = [{ id: 'action-1', label: 'Second Action', icon: <span>2</span> }];

    renderWithTheme(
      <>
        <Fab label="FAB 1" icon={<span>A</span>} actions={actions1} defaultOpen={true} />
        <Fab label="FAB 2" icon={<span>B</span>} actions={actions2} defaultOpen={true} />
      </>
    );

    const firstActionBtn = screen.getByRole('menuitem', { name: 'First Action' });
    const secondActionBtn = screen.getByRole('menuitem', { name: 'Second Action' });

    const firstLabelId = firstActionBtn.getAttribute('aria-labelledby');
    const secondLabelId = secondActionBtn.getAttribute('aria-labelledby');

    expect(firstLabelId).toBeTruthy();
    expect(secondLabelId).toBeTruthy();
    expect(firstLabelId).not.toEqual(secondLabelId);
  });

  it('applies visible focus indicators when focused via keyboard', () => {
    renderWithTheme(
      <Fab
        label="Focusable FAB"
        icon={<span>★</span>}
        actions={mockActions}
        defaultOpen={true}
      />
    );

    const mainBtn = screen.getByRole('button', { name: 'Focusable FAB' });
    expect(mainBtn.style.outline).toBe('none');

    fireEvent.focus(mainBtn);
    expect(mainBtn.style.outline).toContain('solid');

    fireEvent.blur(mainBtn);
    expect(mainBtn.style.outline).toBe('none');

    // Sub-action item focus
    const subActionBtn = screen.getByRole('menuitem', { name: 'Create Project' });
    expect(subActionBtn.style.outline).toBe('none');

    fireEvent.focus(subActionBtn);
    expect(subActionBtn.style.outline).toContain('solid');
  });
});
