import React, {
  useState,
  type ReactNode,
  type ComponentPropsWithoutRef,
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

export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function DropdownMenuTrigger({ asChild = true, children }: DropdownMenuTriggerProps) {
  return <RadixDropdownMenu.Trigger asChild={asChild}>{children}</RadixDropdownMenu.Trigger>;
}

export interface DropdownMenuContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>, 'className' | 'style'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export function DropdownMenuContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { colors, tokens } = useTheme();

  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
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

export interface DropdownMenuItemProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>, 'className' | 'style'> {
  intent?: 'neutral' | 'danger';
  children: ReactNode;
}

export function DropdownMenuItem({
  intent = 'neutral',
  disabled = false,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { colors, tokens } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isDanger = intent === 'danger';
  const defaultTextColor = isDanger ? colors.intent.danger.text : colors.text.primary;
  const hoverBg = isDanger ? colors.intent.danger.subtle : colors.bg.subtle;
  const hoverTextColor = isDanger ? colors.intent.danger.text : colors.text.primary;

  return (
    <RadixDropdownMenu.Item
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
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !disabled && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}

export function DropdownMenuSeparator() {
  const { colors, tokens } = useTheme();
  return (
    <RadixDropdownMenu.Separator
      style={{
        height: '1px',
        backgroundColor: colors.border.subtle,
        margin: `${tokens.spacing[1]} 0`,
      }}
    />
  );
}

export interface DropdownMenuLabelProps {
  children: ReactNode;
}

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  const { colors, tokens } = useTheme();
  return (
    <RadixDropdownMenu.Label
      style={{
        padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        userSelect: 'none',
      }}
    >
      {children}
    </RadixDropdownMenu.Label>
  );
}

export interface DropdownMenuGroupProps {
  children: ReactNode;
}

export function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <RadixDropdownMenu.Group>{children}</RadixDropdownMenu.Group>;
}
