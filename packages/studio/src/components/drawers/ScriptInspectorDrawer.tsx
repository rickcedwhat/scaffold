import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTheme } from '@scaffold/ui';
import type { ScriptRuleNodeConfig } from '../../types';

export interface ScriptInspectorDrawerProps {
  script: ScriptRuleNodeConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ScriptInspectorDrawer({
  script,
  isOpen,
  onClose,
}: ScriptInspectorDrawerProps) {
  const { colors, tokens } = useTheme();

  if (!script) return null;

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: colors.overlay.backdrop,
            backdropFilter: 'blur(3px)',
          }}
        />
        <RadixDialog.Content
          style={{
            position: 'fixed',
            inset: '0 0 0 auto',
            zIndex: 101,
            width: '100%',
            maxWidth: '560px',
            height: '100%',
            backgroundColor: colors.bg.surface,
            borderLeft: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: tokens.shadows.lg,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.bg.subtle,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: `2px ${tokens.spacing[2]}`,
                  borderRadius: tokens.radii.sm,
                  backgroundColor: colors.intent.primary.subtle,
                  color: colors.intent.primary.main,
                }}
              >
                SCRIPT &amp; RULE NODE INSPECTOR
              </span>
              <RadixDialog.Title asChild>
                <h3
                  style={{
                    margin: `${tokens.spacing[1]} 0 0 0`,
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: colors.text.primary,
                  }}
                >
                  {script.title}
                </h3>
              </RadixDialog.Title>
              {script.filePath && (
                <p
                  style={{
                    margin: `${tokens.spacing[1]} 0 0 0`,
                    fontSize: '12px',
                    color: colors.text.muted,
                    fontFamily: 'monospace',
                  }}
                >
                  {script.filePath}
                </p>
              )}
            </div>

            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close drawer"
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.md,
                  color: colors.text.muted,
                  padding: tokens.spacing[2],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &#x2715;
              </button>
            </RadixDialog.Close>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[4],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          >
            {/* Consumed Inputs */}
            <div>
              <span
                style={{
                  color: colors.text.muted,
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: tokens.spacing[2],
                }}
              >
                Input Signals Consumed:
              </span>
              <div
                style={{
                  backgroundColor: colors.bg.canvas,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.radii.md,
                  border: `1px solid ${colors.border.subtle}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                }}
              >
                {script.consumedInputs.map((input, idx) => (
                  <div key={idx} style={{ color: colors.text.primary }}>
                    <span style={{ color: colors.intent.primary.main }}>&bull; </span>
                    <span>{input}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executable Code */}
            <div>
              <span
                style={{
                  color: colors.text.muted,
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: tokens.spacing[2],
                }}
              >
                Active Rule Logic:
              </span>
              <pre
                style={{
                  margin: 0,
                  padding: tokens.spacing[3],
                  backgroundColor: colors.bg.canvas,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.lg,
                  color: colors.text.primary,
                  fontSize: '11px',
                  lineHeight: 1.55,
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                }}
              >
                {script.fullCode || script.codeSnippet}
              </pre>
            </div>

            {/* Decision Stats */}
            {script.decisionStats && (
              <div>
                <span
                  style={{
                    color: colors.text.muted,
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Decision Stats:
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: tokens.spacing[3],
                  }}
                >
                  <div
                    style={{
                      backgroundColor: colors.bg.canvas,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.radii.md,
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    <span style={{ color: colors.text.muted, display: 'block', fontSize: '11px' }}>
                      {script.decisionStats.primaryLabel}
                    </span>
                    <strong
                      style={{
                        fontSize: '16px',
                        color: colors.intent.danger.main,
                        marginTop: tokens.spacing[1],
                        display: 'block',
                      }}
                    >
                      {script.decisionStats.primaryCount}
                    </strong>
                  </div>

                  <div
                    style={{
                      backgroundColor: colors.bg.canvas,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.radii.md,
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    <span style={{ color: colors.text.muted, display: 'block', fontSize: '11px' }}>
                      {script.decisionStats.secondaryLabel}
                    </span>
                    <strong
                      style={{
                        fontSize: '16px',
                        color: colors.intent.success.main,
                        marginTop: tokens.spacing[1],
                        display: 'block',
                      }}
                    >
                      {script.decisionStats.secondaryCount}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
