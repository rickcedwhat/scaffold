import React, {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ElementRef,
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
    <TooltipProvider>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {children}
      </RadixTooltip.Root>
    </TooltipProvider>
  );
}

export interface TooltipTriggerProps
  extends ComponentPropsWithoutRef<typeof RadixTooltip.Trigger> {
  asChild?: boolean;
  children: ReactNode;
}

export const TooltipTrigger = forwardRef<
  ElementRef<typeof RadixTooltip.Trigger>,
  TooltipTriggerProps
>(function TooltipTrigger({ asChild = true, children, ...props }, ref) {
  return (
    <RadixTooltip.Trigger ref={ref} asChild={asChild} {...props}>
      {children}
    </RadixTooltip.Trigger>
  );
});

export interface TooltipContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTooltip.Content>, 'className' | 'style'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  TooltipContentProps
>(function TooltipContent(
  {
    side = 'top',
    align = 'center',
    sideOffset = 6,
    children,
    ...props
  },
  ref
) {
  const { colors, tokens } = useTheme();

  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
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
});

