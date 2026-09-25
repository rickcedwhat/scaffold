import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@scaffold/ui';
import { IssueReportModal } from './IssueReportModal';
import { FeedbackWidget } from './FeedbackWidget';
import { createNoopIssueAdapter } from './adapters/noop';
import type { IssueAdapter } from './types';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider defaultMode="light">{ui}</ThemeProvider>);
}

describe('IssueReportModal', () => {
  it('renders nothing when disabled', () => {
    const { container } = renderWithTheme(
      <IssueReportModal
        open
        onOpenChange={() => undefined}
        enabled={false}
        adapter={createNoopIssueAdapter()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing without an adapter', () => {
    const { container } = renderWithTheme(
      <IssueReportModal open onOpenChange={() => undefined} enabled />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('validates fields and submits through the adapter', async () => {
    const submit = vi.fn(
      async (_payload: unknown) => ({
        id: '7',
        url: 'https://github.com/acme/app/issues/7',
        provider: 'github',
      }),
    );
    const adapter: IssueAdapter = { name: 'github', submit };
    const onSubmitted = vi.fn();

    renderWithTheme(
      <IssueReportModal
        open
        onOpenChange={() => undefined}
        enabled
        adapter={adapter}
        onSubmitted={onSubmitted}
        pathname="/dashboard"
      />,
    );

    expect(screen.getByText('Report an issue')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/short summary/i), {
      target: { value: 'Settings save failed' },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/what went wrong/i),
      { target: { value: 'Save button stays disabled after edits.' } },
    );

    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(1);
    });

    const payload = submit.mock.calls[0]![0] as {
      title: string;
      kind: string;
      diagnostics: { pathname: string };
    };
    expect(payload).toMatchObject({
      title: 'Settings save failed',
      kind: 'feedback',
    });
    expect(payload.diagnostics.pathname).toBe('/dashboard');

    expect(await screen.findByText(/your report was filed/i)).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ id: '7', provider: 'github' }),
    );
  });

  it('surfaces adapter errors', async () => {
    const adapter: IssueAdapter = {
      name: 'github',
      submit: async () => {
        throw new Error('GitHub Issues API failed (401)');
      },
    };

    renderWithTheme(
      <IssueReportModal open onOpenChange={() => undefined} enabled adapter={adapter} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/short summary/i), {
      target: { value: 'Auth failure' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what went wrong/i), {
      target: { value: 'Token rejected by the Issues API unexpectedly.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/GitHub Issues API failed \(401\)/);
  });
});

describe('FeedbackWidget', () => {
  it('renders nothing when reporting is disabled', () => {
    const { container } = renderWithTheme(
      <FeedbackWidget enabled={false} adapter={createNoopIssueAdapter()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the modal from the floating action button', async () => {
    renderWithTheme(
      <FeedbackWidget
        enabled
        adapter={createNoopIssueAdapter({ id: 'n1', url: '' })}
        captureConsole={false}
        toastOnSuccess={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /report an issue/i }));
    expect(await screen.findByText('Report an issue')).toBeInTheDocument();
  });
});
