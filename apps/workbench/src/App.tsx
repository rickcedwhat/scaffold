import React, { useState } from 'react';
import { Button, Stack, useTheme, type ButtonIntent, type ButtonVariant, type ButtonSize } from '@scaffold/ui';

export function App() {
  const { mode, toggleMode, colors, tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<'buttons' | 'stack' | 'tokens'>('buttons');

  const intents: ButtonIntent[] = ['primary', 'secondary', 'neutral', 'success', 'danger'];
  const variants: ButtonVariant[] = ['solid', 'outline', 'subtle', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${colors.border.subtle}`,
          backgroundColor: colors.bg.surface,
          padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
        }}
      >
        <Stack direction="row" align="center" justify="between">
          <Stack direction="row" align="center" gap={3}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.radii.md,
                backgroundColor: colors.intent.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              SC
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: tokens.typography.fontSize.base, fontWeight: tokens.typography.fontWeight.bold }}>
                Scaffold Workbench
              </h1>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.secondary }}>
                Port 5500 &bull; Strict Design System Preview
              </span>
            </div>
          </Stack>

          <Stack direction="row" align="center" gap={2}>
            <Button
              variant={activeTab === 'buttons' ? 'solid' : 'ghost'}
              intent={activeTab === 'buttons' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('buttons')}
            >
              Buttons
            </Button>
            <Button
              variant={activeTab === 'stack' ? 'solid' : 'ghost'}
              intent={activeTab === 'stack' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('stack')}
            >
              Stack Layout
            </Button>
            <Button
              variant={activeTab === 'tokens' ? 'solid' : 'ghost'}
              intent={activeTab === 'tokens' ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setActiveTab('tokens')}
            >
              Tokens
            </Button>
            <Button
              variant="outline"
              intent="neutral"
              size="sm"
              onClick={toggleMode}
            >
              {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </Stack>
        </Stack>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: tokens.spacing[8] }}>
        {activeTab === 'buttons' && (
          <Stack gap={8}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[2] }}>
                Button Intents &amp; Variants
              </h2>
              <p style={{ color: colors.text.secondary, marginBottom: tokens.spacing[6] }}>
                Every button variant strictly derives from theme tokens. No arbitrary classes or custom hex codes allowed.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: tokens.spacing[6] }}>
                {variants.map((v) => (
                  <div
                    key={v}
                    style={{
                      backgroundColor: colors.bg.surface,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: tokens.radii.lg,
                      padding: tokens.spacing[5],
                    }}
                  >
                    <h3 style={{ textTransform: 'capitalize', margin: `0 0 ${tokens.spacing[4]} 0`, fontSize: tokens.typography.fontSize.base }}>
                      Variant: {v}
                    </h3>
                    <Stack gap={3}>
                      {intents.map((i) => (
                        <Button key={i} variant={v} intent={i}>
                          {i.charAt(0).toUpperCase() + i.slice(1)} ({v})
                        </Button>
                      ))}
                    </Stack>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[2] }}>
                Button Sizes &amp; States
              </h2>
              <div
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing[5],
                }}
              >
                <Stack gap={5}>
                  <div>
                    <h4 style={{ margin: `0 0 ${tokens.spacing[2]} 0` }}>Sizes (sm, md, lg)</h4>
                    <Stack direction="row" align="center" gap={3}>
                      {sizes.map((s) => (
                        <Button key={s} size={s}>
                          Size {s.toUpperCase()}
                        </Button>
                      ))}
                    </Stack>
                  </div>

                  <div>
                    <h4 style={{ margin: `0 0 ${tokens.spacing[2]} 0` }}>States (Disabled, Loading)</h4>
                    <Stack direction="row" align="center" gap={3}>
                      <Button disabled>Disabled Solid</Button>
                      <Button variant="outline" disabled>Disabled Outline</Button>
                      <Button loading>Loading State</Button>
                      <Button variant="subtle" intent="success" loading>Saving...</Button>
                    </Stack>
                  </div>
                </Stack>
              </div>
            </section>
          </Stack>
        )}

        {activeTab === 'stack' && (
          <Stack gap={6}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[2] }}>
                Stack Primitive
              </h2>
              <p style={{ color: colors.text.secondary, marginBottom: tokens.spacing[4] }}>
                Governs layouts with strict design token spacing, eliminating the need for AI to guess margins or paddings.
              </p>

              <div
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing[6],
                }}
              >
                <h4 style={{ margin: `0 0 ${tokens.spacing[3]} 0` }}>Horizontal Row (gap=3, align=center)</h4>
                <Stack direction="row" align="center" gap={3} wrap>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
                        backgroundColor: colors.bg.subtle,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: tokens.radii.md,
                      }}
                    >
                      Block {item}
                    </div>
                  ))}
                </Stack>
              </div>
            </section>
          </Stack>
        )}

        {activeTab === 'tokens' && (
          <Stack gap={6}>
            <section>
              <h2 style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[2] }}>
                Semantic Color Tokens ({mode} mode)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacing[4] }}>
                {Object.entries(colors.intent).map(([name, intentToken]) => (
                  <div
                    key={name}
                    style={{
                      backgroundColor: colors.bg.surface,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: tokens.radii.md,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ height: '60px', backgroundColor: intentToken.main }} />
                    <div style={{ padding: tokens.spacing[3] }}>
                      <strong style={{ display: 'block', textTransform: 'capitalize' }}>{name}</strong>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.muted }}>
                        {intentToken.main}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Stack>
        )}
      </main>
    </div>
  );
}
