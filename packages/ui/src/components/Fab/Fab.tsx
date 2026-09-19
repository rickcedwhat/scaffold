import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type FabPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type FabSize = 'sm' | 'md' | 'lg';
export type FabIntent = 'primary' | 'secondary' | 'neutral' | 'success' | 'danger';
export type FabMenuTrigger = 'click' | 'hover' | 'both';
export type FabDirection = 'up' | 'down' | 'left' | 'right';

export type FabActionItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  intent?: FabIntent;
  disabled?: boolean;
};

export type FabAction = FabActionItem;
export type FabTrigger = FabMenuTrigger;

export interface FabProps {
  /** Accessible label describing the FAB action or menu */
  label?: string;
  /** Accessible label alias for label */
  ariaLabel?: string;
  /** Primary icon displayed inside the main FAB */
  icon: ReactNode;
  /** Optional icon shown when the speed-dial menu is open (defaults to an 'X' close icon) */
  activeIcon?: ReactNode;
  /** Visual intent for styling the main button (defaults to 'primary') */
  intent?: FabIntent;
  /** Size variant: 'sm' (40px), 'md' (52px), 'lg' (60px) */
  size?: FabSize;
  /** Viewport anchor placement when not dragged (defaults to 'bottom-right') */
  placement?: FabPlacement;
  /** Pixel offset from the viewport edges [x, y] (defaults to [24, 24]) */
  offset?: [number, number];
  /** Enables freeform pointer-driven dragging and repositioning across the viewport */
  draggable?: boolean;
  /** Primary click handler when no sub-actions are provided */
  onClick?: () => void;
  /** Callback fired when user finishes dragging */
  onDragEnd?: (coords: { x: number; y: number }) => void;
  /** Sub-action items for expandable speed-dial menu mode */
  actions?: FabActionItem[];
  /** Trigger mode for opening the speed-dial menu ('click', 'hover', 'both') */
  menuTrigger?: FabMenuTrigger;
  /** Trigger mode alias for menuTrigger */
  trigger?: FabMenuTrigger;
  /** Direction speed-dial sub-actions expand towards ('up', 'down', 'left', 'right') */
  direction?: FabDirection;
  /** Optional notification badge: true for indicator dot, string or number for count pill */
  badge?: number | string | boolean;
  /** Controlled open state for speed-dial menu */
  open?: boolean;
  /** Default open state for speed-dial menu */
  defaultOpen?: boolean;
  /** Callback fired when speed-dial open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disables the FAB and prevents interactions */
  disabled?: boolean;
  /** Z-index layer for the floating button and its overlay elements (defaults to 1000) */
  zIndex?: number;
}

const SIZE_MAP: Record<
  FabSize,
  {
    mainSize: number;
    subSize: number;
    iconSize: number;
    subIconSize: number;
  }
> = {
  sm: { mainSize: 42, subSize: 34, iconSize: 18, subIconSize: 15 },
  md: { mainSize: 54, subSize: 42, iconSize: 22, subIconSize: 18 },
  lg: { mainSize: 64, subSize: 48, iconSize: 26, subIconSize: 21 },
};

export const Fab = forwardRef<HTMLDivElement, FabProps>(function Fab(
  {
    label: explicitLabel,
    ariaLabel,
    icon,
    activeIcon,
    intent = 'primary',
    size = 'md',
    placement = 'bottom-right',
    offset = [24, 24],
    draggable = false,
    onClick,
    onDragEnd,
    actions = [],
    menuTrigger: explicitTrigger = 'click',
    trigger,
    direction,
    badge,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    zIndex = 1000,
  },
  forwardedRef
) {
  const { tokens, colors } = useTheme();
  const instanceId = useId();
  const label = explicitLabel || ariaLabel || 'Floating action button';
  const menuTrigger = trigger || explicitTrigger;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isMenuOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMainFocused, setIsMainFocused] = useState(false);
  const [focusedActionIndex, setFocusedActionIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const justDraggedRef = useRef(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hasActions = actions.length > 0;
  const config = SIZE_MAP[size];

  // Resolve expansion direction based on placement if not explicitly passed
  const resolvedDirection: FabDirection =
    direction || (placement.startsWith('bottom') ? 'up' : 'down');

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
      if (!nextOpen) {
        setFocusedActionIndex(-1);
      }
    },
    [controlledOpen, onOpenChange]
  );

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, setOpen]);

  // Keep coords clamped within viewport on window resize if dragged
  useEffect(() => {
    if (!coords) return;

    const handleResize = () => {
      const safePadding = 12;
      const maxX = Math.max(safePadding, window.innerWidth - config.mainSize - safePadding);
      const maxY = Math.max(safePadding, window.innerHeight - config.mainSize - safePadding);

      setCoords((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(Math.max(safePadding, prev.x), maxX),
          y: Math.min(Math.max(safePadding, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [coords, config.mainSize]);

  // Drag Pointer Handlers
  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggable || disabled) return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      elementStartRef.current = { x: rect.left, y: rect.top };
    }

    setIsDragging(true);
    hasMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (!hasMovedRef.current && Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
      if (isMenuOpen) {
        setOpen(false);
      }
    }

    if (hasMovedRef.current) {
      const safePadding = 12;
      const maxX = Math.max(safePadding, window.innerWidth - config.mainSize - safePadding);
      const maxY = Math.max(safePadding, window.innerHeight - config.mainSize - safePadding);

      const nextX = Math.min(Math.max(safePadding, elementStartRef.current.x + dx), maxX);
      const nextY = Math.min(Math.max(safePadding, elementStartRef.current.y + dy), maxY);

      lastCoordsRef.current = { x: nextX, y: nextY };
      setCoords({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already lost
    }

    if (hasMovedRef.current) {
      justDraggedRef.current = true;
      if (lastCoordsRef.current) {
        onDragEnd?.(lastCoordsRef.current);
      }
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 50);
    }
  };

  const handleMainButtonClick = () => {
    if (justDraggedRef.current || disabled) return;

    if (hasActions) {
      setOpen(!isMenuOpen);
    } else {
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    if (!hasActions || disabled || isDragging) return;
    if (menuTrigger === 'hover' || menuTrigger === 'both') {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!hasActions || disabled || isDragging) return;
    if (menuTrigger === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 150);
    }
  };

  // Keyboard navigation across actions (skipping disabled items)
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hasActions || !isMenuOpen) return;

    const enabledIndices = actions
      .map((action, i) => (!action.disabled && !disabled ? i : -1))
      .filter((i) => i !== -1);

    if (enabledIndices.length === 0) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedActionIndex((prev) => {
        const currentPos = enabledIndices.indexOf(prev);
        const nextPos = currentPos <= 0 ? enabledIndices.length - 1 : currentPos - 1;
        const nextIndex = enabledIndices[nextPos];
        actionButtonRefs.current[nextIndex]?.focus();
        return nextIndex;
      });
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedActionIndex((prev) => {
        const currentPos = enabledIndices.indexOf(prev);
        const nextPos = currentPos >= enabledIndices.length - 1 ? 0 : currentPos + 1;
        const nextIndex = enabledIndices[nextPos];
        actionButtonRefs.current[nextIndex]?.focus();
        return nextIndex;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstIndex = enabledIndices[0];
      setFocusedActionIndex(firstIndex);
      actionButtonRefs.current[firstIndex]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = enabledIndices[enabledIndices.length - 1];
      setFocusedActionIndex(lastIndex);
      actionButtonRefs.current[lastIndex]?.focus();
    }
  };

  // Intent color styling for main FAB
  const intentColors = colors.intent[intent];

  // Resolve root container placement styles
  const getPlacementStyles = (): React.CSSProperties => {
    if (coords) {
      return {
        position: 'fixed',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      };
    }

    const [offsetX, offsetY] = offset;
    const styles: React.CSSProperties = { position: 'fixed' };

    if (placement.includes('bottom')) {
      styles.bottom = `${offsetY}px`;
    } else {
      styles.top = `${offsetY}px`;
    }

    if (placement.includes('right')) {
      styles.right = `${offsetX}px`;
    } else {
      styles.left = `${offsetX}px`;
    }

    return styles;
  };

  // Speed-dial sub-actions layout styles
  const getSubActionsContainerStyles = (): React.CSSProperties => {
    const isHorizontal = resolvedDirection === 'left' || resolvedDirection === 'right';
    const isReversed = resolvedDirection === 'up' || resolvedDirection === 'left';

    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      gap: tokens.spacing[2],
      pointerEvents: isMenuOpen ? 'auto' : 'none',
      opacity: isMenuOpen ? 1 : 0,
      visibility: isMenuOpen ? 'visible' : 'hidden',
      transition: 'opacity 0.15s ease, transform 0.15s ease',
      transform: isMenuOpen
        ? 'scale(1)'
        : resolvedDirection === 'up'
        ? 'translateY(10px) scale(0.92)'
        : resolvedDirection === 'down'
        ? 'translateY(-10px) scale(0.92)'
        : resolvedDirection === 'left'
        ? 'translateX(10px) scale(0.92)'
        : 'translateX(-10px) scale(0.92)',
    };

    if (isHorizontal) {
      base.flexDirection = isReversed ? 'row-reverse' : 'row';
      base.alignItems = 'center';
      base.top = '50%';
      base.transform = `${base.transform} translateY(-50%)`;
      if (resolvedDirection === 'left') {
        base.right = `${config.mainSize + 12}px`;
      } else {
        base.left = `${config.mainSize + 12}px`;
      }
    } else {
      base.flexDirection = isReversed ? 'column-reverse' : 'column';
      base.alignItems = placement.includes('right') ? 'flex-end' : 'flex-start';
      if (placement.includes('right')) {
        base.right = 0;
      } else {
        base.left = 0;
      }

      if (resolvedDirection === 'up') {
        base.bottom = `${config.mainSize + 12}px`;
      } else {
        base.top = `${config.mainSize + 12}px`;
      }
    }

    return base;
  };

  // Close Icon SVG fallback
  const defaultCloseIcon = (
    <svg
      width={config.iconSize}
      height={config.iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      style={{
        ...getPlacementStyles(),
        zIndex,
        userSelect: 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      data-testid="scaffold-fab-root"
    >
      {/* Expandable Speed-Dial Sub-Actions Container */}
      {hasActions && (
        <div
          role="menu"
          aria-label={`${label} menu`}
          style={getSubActionsContainerStyles()}
          data-testid="scaffold-fab-actions"
        >
          {actions.map((action, index) => {
            const actionIntent = action.intent || 'neutral';
            const actionColors = colors.intent[actionIntent];
            const isHoveredOrFocused = focusedActionIndex === index;
            const labelId = `${instanceId}-fab-label-${action.id}`;

            return (
              <div
                key={action.id}
                role="none"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  flexDirection: placement.includes('right') ? 'row' : 'row-reverse',
                }}
              >
                {/* Action Label Pill */}
                <span
                  id={labelId}
                  style={{
                    backgroundColor: colors.bg.surface,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.subtle}`,
                    borderRadius: tokens.radii.full,
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    boxShadow: tokens.shadows.md,
                    whiteSpace: 'nowrap',
                    opacity: isMenuOpen ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {action.label}
                </span>

                {/* Sub-action Button */}
                <button
                  ref={(btn) => {
                    actionButtonRefs.current[index] = btn;
                  }}
                  type="button"
                  role="menuitem"
                  aria-labelledby={labelId}
                  disabled={action.disabled || disabled}
                  onClick={() => {
                    if (action.disabled || disabled) return;
                    action.onClick?.();
                    setOpen(false);
                  }}
                  onFocus={() => setFocusedActionIndex(index)}
                  onBlur={() => setFocusedActionIndex(-1)}
                  style={{
                    width: `${config.subSize}px`,
                    height: `${config.subSize}px`,
                    borderRadius: tokens.radii.full,
                    backgroundColor: isHoveredOrFocused
                      ? actionColors.hover
                      : colors.bg.surface,
                    color: isHoveredOrFocused
                      ? colors.text.inverse
                      : colors.text.primary,
                    border: `1px solid ${colors.border.subtle}`,
                    boxShadow: tokens.shadows.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: action.disabled || disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled ? 0.5 : 1,
                    transition: 'background-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
                    transform: isHoveredOrFocused ? 'scale(1.08)' : 'scale(1)',
                    outline: isHoveredOrFocused ? `2px solid ${actionColors.main}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {action.icon}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Trigger Floating Action Button */}
      <button
        type="button"
        role="button"
        aria-label={label}
        aria-haspopup={hasActions ? 'menu' : undefined}
        aria-expanded={hasActions ? isMenuOpen : undefined}
        disabled={disabled}
        onClick={handleMainButtonClick}
        onFocus={() => setIsMainFocused(true)}
        onBlur={() => setIsMainFocused(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: `${config.mainSize}px`,
          height: `${config.mainSize}px`,
          borderRadius: tokens.radii.full,
          backgroundColor: intentColors.main,
          color: colors.text.inverse,
          border: 'none',
          boxShadow: tokens.shadows.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled
            ? 'not-allowed'
            : draggable
            ? isDragging
              ? 'grabbing'
              : 'grab'
            : 'pointer',
          touchAction: draggable ? 'none' : 'auto',
          position: 'relative',
          transition: isDragging
            ? 'none'
            : 'background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
          transform: isDragging ? 'scale(1.04)' : 'scale(1)',
          outline: isMainFocused ? `2px solid ${intentColors.main}` : 'none',
          outlineOffset: '3px',
          opacity: disabled ? 0.6 : 1,
        }}
        data-testid="scaffold-fab-button"
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease',
            transform: isMenuOpen && !activeIcon ? 'rotate(90deg)' : 'none',
          }}
        >
          {isMenuOpen && (activeIcon || hasActions)
            ? activeIcon || defaultCloseIcon
            : icon}
        </span>

        {/* Notification Badge Indicator */}
        {badge !== undefined && badge !== false && (
          <span
            data-testid="scaffold-fab-badge"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: colors.intent.danger.main,
              color: colors.text.inverse,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              lineHeight: tokens.typography.lineHeight.tight,
              borderRadius: tokens.radii.full,
              minWidth: badge === true ? '10px' : '18px',
              height: badge === true ? '10px' : '18px',
              padding: badge === true ? 0 : `2px ${tokens.spacing[1]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${colors.bg.canvas}`,
              boxShadow: tokens.shadows.sm,
              pointerEvents: 'none',
            }}
          >
            {badge === true ? null : badge}
          </span>
        )}
      </button>
    </div>
  );
});
