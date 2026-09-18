import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from './Tooltip';
import { Button } from '../Button/Button';

describe('Tooltip', () => {
  it('renders simple tooltip on trigger focus', () => {
    render(
      <Tooltip content="Quick shortcut tooltip">
        <Button>Hover Me</Button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Hover Me' });
    expect(trigger).toBeInTheDocument();

    fireEvent.focus(trigger);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Quick shortcut tooltip');
  });


  it('supports compound syntax', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Info Icon</Button>
          </TooltipTrigger>
          <TooltipContent>Detailed compound explanation</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole('button', { name: 'Info Icon' });
    expect(trigger).toBeInTheDocument();

    fireEvent.focus(trigger);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Detailed compound explanation');
  });

});


