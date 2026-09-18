import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Modal,
} from './Dialog';
import { Button } from '../Button/Button';

describe('Dialog / Modal', () => {
  it('opens and closes via trigger and close button', () => {
    render(
      <Dialog>
        <DialogTrigger>
          <Button>Open Modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information below.</DialogDescription>
          </DialogHeader>
          <div>Form contents here</div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Dialog content should not be present initially
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();

    // Click trigger to open
    fireEvent.click(screen.getByRole('button', { name: /open modal/i }));

    // Content should now be visible
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Update your personal information below.')).toBeInTheDocument();
    expect(screen.getByText('Form contents here')).toBeInTheDocument();

    // Click cancel close button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog should close
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('supports controlled open state', () => {
    function ControlledDialog() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setIsOpen(true)}>External Open</button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogTitle>Controlled Modal</DialogTitle>
              <button onClick={() => setIsOpen(false)}>Custom Close</button>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    render(<ControlledDialog />);
    expect(screen.queryByText('Controlled Modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('External Open'));
    expect(screen.getByText('Controlled Modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Custom Close'));
    expect(screen.queryByText('Controlled Modal')).not.toBeInTheDocument();
  });

  it('exports Modal as an alias for Dialog', () => {
    expect(Modal).toBe(Dialog);
  });
});
