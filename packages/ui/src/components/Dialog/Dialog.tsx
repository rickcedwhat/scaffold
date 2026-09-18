import React, {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithRef,
} from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTheme } from '../../theme/ThemeContext';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

export interface DialogTriggerProps
  extends Omit<ComponentPropsWithRef<typeof RadixDialog.Trigger>, 'className' | 'style'> {
  asChild?: boolean;
  children: ReactNode;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixDialog.Trigger ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixDialog.Trigger>
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

export interface DialogContentProps
  extends Omit<ComponentPropsWithRef<typeof RadixDialog.Content>, 'className' | 'style'> {
  size?: DialogSize;
  showCloseButton?: boolean;
  children: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ size = 'md', showCloseButton = true, children, ...props }, ref) => {
    const { colors, tokens } = useTheme();

    const maxWidthMap: Record<DialogSize, string> = {
      sm: '400px',
      md: '540px',
      lg: '720px',
      xl: '960px',
      full: 'calc(100vw - 32px)',
    };

    return (
      <RadixDialog.Portal>
        {/* Backdrop overlay */}
        <RadixDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: colors.overlay.backdrop,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
        />
        {/* Centered Modal Content */}
        <RadixDialog.Content
          ref={ref}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: maxWidthMap[size],
            maxHeight: tokens.layout.dialogMaxHeight,
            overflowY: 'auto',
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.xl,
            boxShadow: tokens.shadows.xl,
            padding: tokens.spacing[6],
            boxSizing: 'border-box',
            zIndex: 101,
            outline: 'none',
          }}
          {...props}
        >
          {children}
          {showCloseButton && (
            <RadixDialog.Close
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: tokens.spacing[4],
                right: tokens.spacing[4],
                width: tokens.spacing[8],
                height: tokens.spacing[8],
                borderRadius: tokens.radii.md,
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
                width="16"
                height="16"
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
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  }
);
DialogContent.displayName = 'DialogContent';

export interface DialogHeaderProps {
  children: ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  const { tokens } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[1],
        marginBottom: tokens.spacing[4],
        paddingRight: tokens.spacing[6],
      }}
    >
      {children}
    </div>
  );
}

export interface DialogTitleProps
  extends Omit<ComponentPropsWithRef<typeof RadixDialog.Title>, 'className' | 'style'> {
  children: ReactNode;
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, ...props }, ref) => {
    const { colors, tokens } = useTheme();
    return (
      <RadixDialog.Title
        ref={ref}
        style={{
          margin: 0,
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          lineHeight: tokens.typography.lineHeight.snug,
          color: colors.text.primary,
          letterSpacing: tokens.typography.letterSpacing.tight,
        }}
        {...props}
      >
        {children}
      </RadixDialog.Title>
    );
  }
);
DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps
  extends Omit<ComponentPropsWithRef<typeof RadixDialog.Description>, 'className' | 'style'> {
  children: ReactNode;
}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, ...props }, ref) => {
    const { colors, tokens } = useTheme();
    return (
      <RadixDialog.Description
        ref={ref}
        style={{
          margin: 0,
          fontSize: tokens.typography.fontSize.sm,
          lineHeight: tokens.typography.lineHeight.relaxed,
          color: colors.text.muted,
        }}
        {...props}
      >
        {children}
      </RadixDialog.Description>
    );
  }
);
DialogDescription.displayName = 'DialogDescription';

export interface DialogFooterProps {
  children: ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  const { tokens } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: tokens.spacing[3],
        marginTop: tokens.spacing[6],
      }}
    >
      {children}
    </div>
  );
}

export interface DialogCloseProps
  extends Omit<ComponentPropsWithRef<typeof RadixDialog.Close>, 'className' | 'style'> {
  asChild?: boolean;
  children: ReactNode;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = true, children, ...props }, ref) => {
    return (
      <RadixDialog.Close ref={ref} asChild={asChild} {...props}>
        {children}
      </RadixDialog.Close>
    );
  }
);
DialogClose.displayName = 'DialogClose';

// Aliases for Modal terminology
export const Modal = Dialog;
export const ModalTrigger = DialogTrigger;
export const ModalContent = DialogContent;
export const ModalHeader = DialogHeader;
export const ModalTitle = DialogTitle;
export const ModalDescription = DialogDescription;
export const ModalFooter = DialogFooter;
export const ModalClose = DialogClose;
export type ModalSize = DialogSize;
