import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from './Tooltip';
import { Button } from '../Button/Button';

describe('Tooltip', () => {
  it('renders simple tooltip on trigger focus/hover', async () => {
    render(
      <Tooltip content="Quick shortcut tooltip" defaultOpen>
        <Button>Hover Me</Button>
      </Tooltip>
    );

    expect(screen.getByText('Hover Me')).toBeInTheDocument();
    expect(screen.getByText('Quick shortcut tooltip')).toBeInTheDocument();
  });

  it('supports compound syntax', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>
            <button>Info Icon</button>
          </TooltipTrigger>
          <TooltipContent>Detailed compound explanation</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getByText('Detailed compound explanation')).toBeInTheDocument();
  });
});
