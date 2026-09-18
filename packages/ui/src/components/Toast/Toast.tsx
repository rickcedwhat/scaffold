import React, {
  useState,
  useEffect,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { useTheme } from '../../theme/ThemeContext';

export type ToastIntent = 'neutral' | 'primary' | 'success' | 'danger' | 'warning';

export interface ToastItem {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  intent?: ToastIntent;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ---------------------------------------------------------------------------
// Global Toast Store (imperative toast() support)
// ---------------------------------------------------------------------------
type ToastListener = (toasts: ToastItem[]) => void;

class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  add(toast: Omit<ToastItem, 'id'> & { id?: string }): string {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { ...toast, id };
    this.toasts = [item, ...this.toasts].slice(0, 5); // Keep up to 5 concurrent toasts
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastStore = new ToastStore();

/**
 * Imperatively fire a toast notification from anywhere in the application.
 */
export function toast(options: Omit<ToastItem, 'id'> & { id?: string }): string {
  return toastStore.add(options);
}

toast.success = (title: ReactNode, options?: Partial<Omit<ToastItem, 'id' | 'title'>>) =>
  toastStore.add({ title, intent: 'success', ...options });

toast.error = (title: ReactNode, options?: Partial<Omit<ToastItem, 'id' | 'title'>>) =>
  toastStore.add({ title, intent: 'danger', ...options });

toast.info = (title: ReactNode, options?: Partial<Omit<ToastItem, 'id' | 'title'>>) =>
  toastStore.add({ title, intent: 'primary', ...options });

toast.dismiss = (id: string) => toastStore.remove(id);
toast.clear = () => toastStore.clear();

// ---------------------------------------------------------------------------
// Hook for active toasts and dismiss dispatcher
// ---------------------------------------------------------------------------
export interface ToastStateValue {
  toast: typeof toast;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

export function useToast(): ToastStateValue {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return {
    toast,
    toasts,
    dismiss: (id: string) => toastStore.remove(id),
  };
}

// ---------------------------------------------------------------------------
// Low-level Radix Primitives
// ---------------------------------------------------------------------------
export interface ToastProviderProps {
  swipeDirection?: 'right' | 'left' | 'up' | 'down';
  duration?: number;
  children: ReactNode;
}

export function ToastProvider({
  swipeDirection = 'right',
  duration = 5000,
  children,
}: ToastProviderProps) {
  return (
    <RadixToast.Provider swipeDirection={swipeDirection} duration={duration}>
      {children}
    </RadixToast.Provider>
  );
}

export interface ToastViewportProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastViewport({ position = 'bottom-right' }: ToastViewportProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
  };

  return (
    <RadixToast.Viewport
      style={{
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        zIndex: 200,
        outline: 'none',
        ...positionStyles[position],
      }}
    />
  );
}

export interface ToastProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixToast.Root>, 'className' | 'style'> {
  intent?: ToastIntent;
  children: ReactNode;
}

export function Toast({ intent = 'neutral', children, ...props }: ToastProps) {
  const { colors, tokens } = useTheme();

  const intentBorderColors: Record<ToastIntent, string> = {
    neutral: colors.border.default,
    primary: colors.intent.primary.main,
    success: colors.intent.success.main,
    danger: colors.intent.danger.main,
    warning: '#f59e0b',
  };

  return (
    <RadixToast.Root
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: tokens.spacing[3],
        backgroundColor: colors.bg.surface,
        border: `1px solid ${colors.border.subtle}`,
        borderLeft: `4px solid ${intentBorderColors[intent]}`,
        borderRadius: tokens.radii.lg,
        boxShadow: tokens.shadows.lg,
        padding: tokens.spacing[4],
        boxSizing: 'border-box',
        listStyle: 'none',
        outline: 'none',
      }}
      {...props}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[1],
          flex: 1,
        }}
      >
        {children}
      </div>
    </RadixToast.Root>
  );
}

export interface ToastTitleProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixToast.Title>, 'className' | 'style'> {
  children: ReactNode;
}

export function ToastTitle({ children, ...props }: ToastTitleProps) {
  const { colors, tokens } = useTheme();
  return (
    <RadixToast.Title
      style={{
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: colors.text.primary,
        lineHeight: tokens.typography.lineHeight.snug,
      }}
      {...props}
    >
      {children}
    </RadixToast.Title>
  );
}

export interface ToastDescriptionProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixToast.Description>, 'className' | 'style'> {
  children: ReactNode;
}

export function ToastDescription({ children, ...props }: ToastDescriptionProps) {
  const { colors, tokens } = useTheme();
  return (
    <RadixToast.Description
      style={{
        fontSize: tokens.typography.fontSize.xs,
        color: colors.text.muted,
        lineHeight: tokens.typography.lineHeight.normal,
      }}
      {...props}
    >
      {children}
    </RadixToast.Description>
  );
}

export interface ToastActionProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixToast.Action>, 'className' | 'style'> {
  altText: string;
  children: ReactNode;
}

export function ToastAction({ altText, children, ...props }: ToastActionProps) {
  const { colors, tokens } = useTheme();
  return (
    <RadixToast.Action
      altText={altText}
      style={{
        backgroundColor: colors.bg.subtle,
        color: colors.text.primary,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: tokens.radii.sm,
        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        cursor: 'pointer',
        alignSelf: 'center',
        whiteSpace: 'nowrap',
      }}
      {...props}
    >
      {children}
    </RadixToast.Action>
  );
}

export interface ToastCloseProps {
  children?: ReactNode;
}

export function ToastClose({ children }: ToastCloseProps) {
  const { colors, tokens } = useTheme();
  return (
    <RadixToast.Close
      aria-label="Dismiss toast"
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        color: colors.text.muted,
        cursor: 'pointer',
        padding: tokens.spacing[1],
        borderRadius: tokens.radii.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      {children || (
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
      )}
    </RadixToast.Close>
  );
}

// ---------------------------------------------------------------------------
// High-Level <Toaster /> Component
// ---------------------------------------------------------------------------
export interface ToasterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration?: number;
}

export function Toaster({ position = 'bottom-right', duration = 5000 }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return (
    <ToastProvider duration={duration}>
      {toasts.map((item) => (
        <Toast
          key={item.id}
          intent={item.intent}
          duration={item.duration}
          onOpenChange={(open) => {
            if (!open) {
              toastStore.remove(item.id);
            }
          }}
        >
          {item.title && <ToastTitle>{item.title}</ToastTitle>}
          {item.description && <ToastDescription>{item.description}</ToastDescription>}
          {item.action && (
            <ToastAction altText={item.action.label} onClick={item.action.onClick}>
              {item.action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport position={position} />
    </ToastProvider>
  );
}
