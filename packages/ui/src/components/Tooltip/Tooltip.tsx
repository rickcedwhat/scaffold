import React, {
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useTheme } from '../../theme/ThemeContext';

export interface TooltipProviderProps {
  delayDuration?: number;
  skipDelayDuration?: number;
  children: ReactNode;
}

export function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 300,
  children,
}: TooltipProviderProps) {
  return (
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </RadixTooltip.Provider>
  );
}

export interface TooltipCompoundProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface TooltipSimpleProps {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export type TooltipProps =
  | (TooltipSimpleProps & { content: ReactNode })
  | (TooltipCompoundProps & { content?: never });

export function Tooltip(props: TooltipProps) {
  if ('content' in props && props.content !== undefined) {
    const {
      content,
      side = 'top',
      align = 'center',
      sideOffset = 6,
      open,
      defaultOpen,
      onOpenChange,
      children,
    } = props as TooltipSimpleProps;

    return (
      <TooltipProvider>
        <RadixTooltip.Root
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
        >
          <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
          <TooltipContent side={side} align={align} sideOffset={sideOffset}>
            {content}
          </TooltipContent>
        </RadixTooltip.Root>
      </TooltipProvider>
    );
  }

  const { open, defaultOpen, onOpenChange, children } = props as TooltipCompoundProps;
  return (
    <RadixTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </RadixTooltip.Root>
  );
}

export interface TooltipTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function TooltipTrigger({ asChild = true, children }: TooltipTriggerProps) {
  return <RadixTooltip.Trigger asChild={asChild}>{children}</RadixTooltip.Trigger>;
}

export interface TooltipContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTooltip.Content>, 'className' | 'style'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export function TooltipContent({
  side = 'top',
  align = 'center',
  sideOffset = 6,
  children,
  ...props
}: TooltipContentProps) {
  const { colors, tokens } = useTheme();

  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        style={{
          backgroundColor: colors.text.primary,
          color: colors.text.inverse,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          lineHeight: tokens.typography.lineHeight.tight,
          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
          borderRadius: tokens.radii.sm,
          boxShadow: tokens.shadows.md,
          zIndex: 150,
          pointerEvents: 'none',
          userSelect: 'none',
          maxWidth: '260px',
          wordBreak: 'break-word',
        }}
        {...props}
      >
        {children}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
}
