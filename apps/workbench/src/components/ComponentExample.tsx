import React, { useState, type ReactNode } from 'react';
import { Card, Stack, Heading, Text, Button, Badge, useTheme } from '@scaffold/ui';
import { Code, ChevronUp } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

export interface ComponentExampleProps {
  title: string;
  description?: string;
  code: string;
  language?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

/**
 * ComponentExample
 *
 * Renders an interactive component example with a collapsible code snippet above it
 * (closed by default).
 */
export function ComponentExample({
  title,
  description,
  code,
  language = 'tsx',
  defaultExpanded = false,
  children,
}: ComponentExampleProps) {
  const { colors, tokens } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
                Snippet
              </Badge>
            </Stack>
            {description && (
              <Text size="xs" color="secondary">
                {description}
              </Text>
            )}
          </div>

          <Button
            variant={isExpanded ? 'solid' : 'outline'}
            intent={isExpanded ? 'primary' : 'neutral'}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  <span>Hide Code</span>
                </>
              ) : (
                <>
                  <Code size={14} />
                  <span>View Code</span>
                </>
              )}
            </span>
          </Button>
        </div>

        {/* Collapsible Snippet Above Preview */}
        {isExpanded && (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: colors.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: tokens.spacing[2],
              }}
            >
              Code Snippet
            </div>
            <CodeBlock code={code.trim()} language={language} maxHeight="360px" />
          </div>
        )}

        {/* Component Preview Surface Below Snippet */}
        <div
          style={{
            backgroundColor: colors.bg.canvas,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.md,
            padding: tokens.spacing[4],
            minWidth: 0,
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
      </Stack>
    </Card>
  );
}
