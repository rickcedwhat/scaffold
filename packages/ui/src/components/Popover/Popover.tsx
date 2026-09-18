import React, {
  forwardRef,
  type ReactNode,
  type ReactElement,
  type ComponentPropsWithRef,
} from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { useTheme } from '../../theme/ThemeContext';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: ReactNode;
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
  children,
}: PopoverProps) {
  return (
    <RadixPopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </RadixPopover.Root>
  );
}

export interface PopoverTriggerProps
  extends Omit<ComponentPropsWithRef<typeof RadixPopover.Trigger>, 'className' | 'style'> {
  asChild?: boolean;
  /** Exactly one focusable element when asChild is true that forwards ref and DOM events */
  children: ReactElement;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixPopover.Trigger ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixPopover.Trigger>
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

export interface PopoverContentProps
  extends Omit<ComponentPropsWithRef<typeof RadixPopover.Content>, 'className' | 'style'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  showCloseButton?: boolean;
  children: ReactNode;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      showCloseButton = false,
      children,
      ...props
    },
    ref
  ) => {
    const { colors, tokens } = useTheme();

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          side={side}
          align={align}
          sideOffset={sideOffset}
          style={{
            position: 'relative',
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.lg,
            boxShadow: tokens.shadows.lg,
            padding: tokens.spacing[4],
            boxSizing: 'border-box',
            maxWidth: '360px',
            width: 'max-content',
            zIndex: 100,
            outline: 'none',
          }}
          {...props}
        >
          {children}
          {showCloseButton && (
            <RadixPopover.Close
              aria-label="Close popover"
              style={{
                position: 'absolute',
                top: tokens.spacing[2],
                right: tokens.spacing[2],
                width: '24px',
                height: '24px',
                borderRadius: tokens.radii.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: colors.text.muted,
                padding: 0,
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.subtle;
                e.currentTarget.style.color = colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.text.muted;
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </RadixPopover.Close>
          )}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export interface PopoverCloseProps
  extends Omit<ComponentPropsWithRef<typeof RadixPopover.Close>, 'className' | 'style'> {
  asChild?: boolean;
  children: ReactNode;
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixPopover.Close ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixPopover.Close>
    );
  }
);
PopoverClose.displayName = 'PopoverClose';

export interface PopoverAnchorProps
  extends Omit<ComponentPropsWithRef<typeof RadixPopover.Anchor>, 'className' | 'style'> {
  asChild?: boolean;
  children?: ReactNode;
}

export const PopoverAnchor = forwardRef<HTMLDivElement, PopoverAnchorProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixPopover.Anchor ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixPopover.Anchor>
    );
  }
);
PopoverAnchor.displayName = 'PopoverAnchor';
