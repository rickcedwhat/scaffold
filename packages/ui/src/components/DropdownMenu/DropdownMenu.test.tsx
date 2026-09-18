import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './DropdownMenu';
import { Button } from '../Button/Button';

describe('DropdownMenu', () => {
  it('opens menu and selects items', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Project Options</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleEdit}>Edit Project</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem intent="danger" onSelect={handleDelete}>
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: /actions/i }), {
      button: 0,
      ctrlKey: false,
    });
    expect(screen.getByText('Project Options')).toBeInTheDocument();
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByText('Delete Project')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit Project'));
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('respects disabled items', () => {
    const handleDisabled = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={handleDisabled}>
            Unavailable Action
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: /menu/i }), {
      button: 0,
      ctrlKey: false,
    });

    const disabledItem = screen.getByRole('menuitem', { name: 'Unavailable Action' });
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(disabledItem);
    expect(handleDisabled).not.toHaveBeenCalled();
  });

});
