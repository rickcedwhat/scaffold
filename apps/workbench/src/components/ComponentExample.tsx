import React, { useState, type ReactNode } from 'react';
import { Card, Stack, Heading, Text, Button, Badge, useTheme } from '@scaffold/ui';
import { CodeBlock } from './CodeBlock';

export interface ComponentExampleProps {
  title: string;
  description?: string;
  code: string;
  language?: string;
  defaultSplit?: boolean;
  children: ReactNode;
}

/**
 * ComponentExample
 *
 * Renders an interactive component example alongside the exact, concise code snippet
 * used to create it (with side-by-side split screen IDE syntax highlighting).
 */
export function ComponentExample({
  title,
  description,
  code,
  language = 'tsx',
  defaultSplit = true,
  children,
}: ComponentExampleProps) {
  const { colors, tokens } = useTheme();
  const [isSplit, setIsSplit] = useState(defaultSplit);
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');

  return (
    <Card padding="normal">
      <Stack gap={4}>
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: `1px solid ${colors.border.subtle}`,
            paddingBottom: tokens.spacing[3],
          }}
        >
          <div>
            <Stack direction="row" align="center" gap={2}>
              <Heading level={4} size="base">
                {title}
              </Heading>
              <Badge intent="neutral" size="sm">
                Live Snippet
              </Badge>
            </Stack>
            {description && (
              <Text size="xs" color="secondary">
                {description}
              </Text>
            )}
          </div>

          <Stack direction="row" align="center" gap={2}>
            {/* Split Screen / Toggle button */}
            <Button
              variant={isSplit ? 'solid' : 'outline'}
              intent={isSplit ? 'primary' : 'neutral'}
              size="sm"
              onClick={() => setIsSplit(!isSplit)}
            >
              {isSplit ? '✕ Close Split' : '◫ Split Screen'}
            </Button>

            {!isSplit && (
              <Button
                variant="ghost"
                intent="neutral"
                size="sm"
                onClick={() => setActiveView(activeView === 'preview' ? 'code' : 'preview')}
              >
                {activeView === 'preview' ? '<> View Code' : '👁️ View Preview'}
              </Button>
            )}
          </Stack>
        </div>

        {/* Body content */}
        {isSplit ? (
          /* Side-by-side Split View */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: tokens.spacing[4],
              alignItems: 'stretch',
            }}
          >
            {/* Left: Component Preview Surface */}
            <div
              style={{
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: tokens.radii.md,
                padding: tokens.spacing[4],
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[3],
                }}
              >
                Preview
              </div>
              {children}
            </div>

            {/* Right: Live Code Snippet */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[3],
                }}
              >
                Code Snippet
              </div>
              <CodeBlock code={code.trim()} language={language} maxHeight="420px" />
            </div>
          </div>
        ) : (
          /* Single View (Preview or Code) */
          <div>
            {activeView === 'preview' ? (
              <div
                style={{
                  backgroundColor: colors.bg.canvas,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.md,
                  padding: tokens.spacing[4],
                }}
              >
                {children}
              </div>
            ) : (
              <div>
                <CodeBlock code={code.trim()} language={language} maxHeight="420px" />
              </div>
            )}
          </div>
        )}
      </Stack>
    </Card>
  );
}
