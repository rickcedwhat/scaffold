import React, {
  forwardRef,
  useState,
  type ReactNode,
  type ComponentPropsWithRef,
} from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '../../theme/ThemeContext';

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: ReactNode;
}

export function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  children,
}: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </RadixDropdownMenu.Root>
  );
}

export interface DropdownMenuTriggerProps
  extends Omit<ComponentPropsWithRef<typeof RadixDropdownMenu.Trigger>, 'className' | 'style'> {
  asChild?: boolean;
  children: ReactNode;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixDropdownMenu.Trigger ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixDropdownMenu.Trigger>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps
  extends Omit<ComponentPropsWithRef<typeof RadixDropdownMenu.Content>, 'className' | 'style'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ side = 'bottom', align = 'start', sideOffset = 6, children, ...props }, ref) => {
    const { colors, tokens } = useTheme();

    return (
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          ref={ref}
          side={side}
          align={align}
          sideOffset={sideOffset}
          style={{
            minWidth: '180px',
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.lg,
            boxShadow: tokens.shadows.lg,
            padding: tokens.spacing[1],
            boxSizing: 'border-box',
            zIndex: 100,
            outline: 'none',
          }}
          {...props}
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps
  extends Omit<ComponentPropsWithRef<typeof RadixDropdownMenu.Item>, 'className' | 'style'> {
  intent?: 'neutral' | 'danger';
  children: ReactNode;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  (
    {
      intent = 'neutral',
      disabled = false,
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { colors, tokens } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const isDanger = intent === 'danger';
    const defaultTextColor = isDanger ? colors.intent.danger.main : colors.text.primary;
    const hoverBg = isDanger ? colors.intent.danger.subtle : colors.bg.subtle;
    const hoverTextColor = isDanger ? colors.intent.danger.hover : colors.text.primary;

    return (
      <RadixDropdownMenu.Item
        ref={ref}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
          fontSize: tokens.typography.fontSize.sm,
          color: disabled ? colors.text.muted : isHovered ? hoverTextColor : defaultTextColor,
          backgroundColor: isHovered && !disabled ? hoverBg : 'transparent',
          borderRadius: tokens.radii.md,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
          userSelect: 'none',
          transition: 'background-color 0.12s ease, color 0.12s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        onFocus={(e) => {
          if (!disabled) setIsHovered(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsHovered(false);
          onBlur?.(e);
        }}
        {...props}
      >
        {children}
      </RadixDropdownMenu.Item>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export type DropdownMenuSeparatorProps = Omit<
  ComponentPropsWithRef<typeof RadixDropdownMenu.Separator>,
  'className' | 'style'
>;

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  (props, ref) => {
    const { colors, tokens } = useTheme();
    return (
      <RadixDropdownMenu.Separator
        ref={ref}
        style={{
          height: '1px',
          backgroundColor: colors.border.subtle,
          margin: `${tokens.spacing[1]} 0`,
        }}
        {...props}
      />
    );
  }
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export interface DropdownMenuLabelProps
  extends Omit<ComponentPropsWithRef<typeof RadixDropdownMenu.Label>, 'className' | 'style'> {
  children: ReactNode;
}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, ...props }, ref) => {
    const { colors, tokens } = useTheme();
    return (
      <RadixDropdownMenu.Label
        ref={ref}
        style={{
          padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          userSelect: 'none',
        }}
        {...props}
      >
        {children}
      </RadixDropdownMenu.Label>
    );
  }
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export interface DropdownMenuGroupProps {
  children: ReactNode;
}

export function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <RadixDropdownMenu.Group>{children}</RadixDropdownMenu.Group>;
}
