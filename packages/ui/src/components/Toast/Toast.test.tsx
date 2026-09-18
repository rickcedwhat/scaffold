import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  toast,
  toastStore,
  useToast,
  Toaster,
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastViewport,
} from './Toast';

describe('Toast System', () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it('renders low-level compound toast primitives', () => {
    const handleAction = vi.fn();

    render(
      <ToastProvider>
        <Toast intent="success">
          <ToastTitle>Changes saved</ToastTitle>
          <ToastDescription>Your settings are synced to the cloud.</ToastDescription>
          <ToastAction altText="Undo changes" onClick={handleAction}>
            Undo
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByText('Changes saved')).toBeInTheDocument();
    expect(screen.getByText('Your settings are synced to the cloud.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Undo'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('handles imperative toast(), toast.success(), and toast.error() via <Toaster />', () => {
    render(<Toaster />);

    act(() => {
      toast({
        title: 'File Uploaded',
        description: 'document.pdf was uploaded successfully.',
        intent: 'primary',
      });
    });

    expect(screen.getByText('File Uploaded')).toBeInTheDocument();
    expect(screen.getByText('document.pdf was uploaded successfully.')).toBeInTheDocument();

    act(() => {
      toast.success('Deployed to Production');
    });
    expect(screen.getByText('Deployed to Production')).toBeInTheDocument();

    act(() => {
      toast.error('Build Failed');
    });
    expect(screen.getByText('Build Failed')).toBeInTheDocument();

    act(() => {
      toast.clear();
    });
    expect(screen.queryByText('File Uploaded')).not.toBeInTheDocument();
    expect(screen.queryByText('Deployed to Production')).not.toBeInTheDocument();
    expect(screen.queryByText('Build Failed')).not.toBeInTheDocument();
  });

  it('useToast hook exposes active toasts and dismiss dispatcher', () => {
    function TestConsumer() {
      const { toast: sendToast, toasts, dismiss } = useToast();
      return (
        <div>
          <button onClick={() => sendToast({ title: 'Dynamic Toast', id: 'dyn-1' })}>
            Trigger
          </button>
          <div data-testid="toast-count">{toasts.length}</div>
          {toasts.map((t) => (
            <button key={t.id} onClick={() => dismiss(t.id)}>
              Dismiss {t.title}
            </button>
          ))}
        </div>
      );
    }

    render(<TestConsumer />);
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText('Dismiss Dynamic Toast')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dismiss Dynamic Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });
});
