import React, {
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface SidebarProps {
  width?: string | number;
  children: ReactNode;
}

/**
 * Root Sidebar Container
 *
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export function Sidebar({ width = '260px', children }: SidebarProps) {
  const { colors } = useTheme();

  const sidebarStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    minWidth: typeof width === 'number' ? `${width}px` : width,
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg.surface,
    borderRight: `1px solid ${colors.border.subtle}`,
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  return <aside style={sidebarStyles}>{children}</aside>;
}

export interface SidebarHeaderProps {
  children: ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const { tokens, colors } = useTheme();

  const headerStyles: React.CSSProperties = {
    padding: `${tokens.spacing[4]} ${tokens.spacing[4]}`,
    borderBottom: `1px solid ${colors.border.subtle}`,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  return <div style={headerStyles}>{children}</div>;
}

export interface SidebarNavProps {
  children: ReactNode;
}

export function SidebarNav({ children }: SidebarNavProps) {
  const { tokens } = useTheme();

  const navStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: `${tokens.spacing[3]} ${tokens.spacing[2]}`,
    gap: tokens.spacing[1],
    boxSizing: 'border-box',
  };

  return <nav style={navStyles}>{children}</nav>;
}

export interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  const { tokens, colors } = useTheme();

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[3],
  };

  const titleStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]} ${tokens.spacing[1]}`,
    fontFamily: tokens.typography.fontFamily.sans,
    userSelect: 'none',
  };

  return (
    <div style={sectionStyles}>
      {title && <div style={titleStyles}>{title}</div>}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  active?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  as?: 'a' | 'button';
  disabled?: boolean;
  children: ReactNode;
}

export function SidebarItem({
  active = false,
  icon,
  badge,
  href,
  onClick,
  as,
  disabled = false,
  children,
}: SidebarItemProps) {
  const { tokens, colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // If href is provided and 'as' is not specified, default to 'a', otherwise 'button'
  const ComponentTag = as || (href ? 'a' : 'button');

  const getBackgroundColor = () => {
    if (active) return colors.intent.primary.subtle;
    if (isHovered && !disabled) return colors.bg.subtle;
    return 'transparent';
  };

  const getTextColor = () => {
    if (active) return colors.intent.primary.main;
    if (isHovered && !disabled) return colors.text.primary;
    return colors.text.secondary;
  };

  const itemStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    borderRadius: tokens.radii.md,
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: active
      ? tokens.typography.fontWeight.semibold
      : tokens.typography.fontWeight.medium,
    textDecoration: 'none',
    border: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.15s ease, color 0.15s ease',
    textAlign: 'left',
    gap: tokens.spacing[2],
  };

  const activeIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    left: '2px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '16px',
    backgroundColor: colors.intent.primary.main,
    borderRadius: tokens.radii.full,
  };

  const iconStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: tokens.typography.fontSize.base,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const badgeStyles: React.CSSProperties = {
    marginLeft: 'auto',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  };

  const commonProps = {
    style: itemStyles,
    'aria-current': active ? ('page' as const) : undefined,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick,
  };

  return (
    <ComponentTag
      {...(ComponentTag === 'a' ? { href } : { type: 'button', disabled })}
      {...(commonProps as any)}
    >
      {active && <span style={activeIndicatorStyles} aria-hidden="true" />}
      {icon && <span style={iconStyles}>{icon}</span>}
      <span style={contentStyles}>{children}</span>
      {badge && <span style={badgeStyles}>{badge}</span>}
    </ComponentTag>
  );
}

export interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  const { tokens, colors } = useTheme();

  const footerStyles: React.CSSProperties = {
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderTop: `1px solid ${colors.border.subtle}`,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    marginTop: 'auto',
  };

  return <div style={footerStyles}>{children}</div>;
}
