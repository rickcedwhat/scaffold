import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from './Popover';
import { Button } from '../Button/Button';

describe('Popover', () => {
  it('toggles content visibility on trigger click', () => {
    render(
      <Popover>
        <PopoverTrigger>
          <Button>Toggle Filter</Button>
        </PopoverTrigger>
        <PopoverContent showCloseButton>
          <div>Filter Settings</div>
          <PopoverClose>
            <Button size="sm">Apply</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    );

    expect(screen.queryByText('Filter Settings')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /toggle filter/i }));
    expect(screen.getByText('Filter Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close popover/i })).toBeInTheDocument();

    // Click Apply to close
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(screen.queryByText('Filter Settings')).not.toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    function ControlledPopover() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(!open)}>External Toggle</button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <button type="button">Anchor</button>
            </PopoverTrigger>
            <PopoverContent>
              <div>Controlled Body</div>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    render(<ControlledPopover />);
    expect(screen.queryByText('Controlled Body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('External Toggle'));
    expect(screen.getByText('Controlled Body')).toBeInTheDocument();

    fireEvent.click(screen.getByText('External Toggle'));
    expect(screen.queryByText('Controlled Body')).not.toBeInTheDocument();
  });
});
