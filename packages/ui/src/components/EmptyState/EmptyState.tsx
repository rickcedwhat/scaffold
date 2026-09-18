import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Heading, type HeadingLevel } from '../Heading/Heading';
import { Text } from '../Text/Text';
import {
  StatusIllustration,
  type IllustrationPreset,
  type IllustrationSize,
} from '../StatusIllustration/StatusIllustration';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateLayout = 'vertical' | 'horizontal';

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className' | 'title'> {
  preset?: IllustrationPreset;
  illustration?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  layout?: EmptyStateLayout;
  bordered?: boolean;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      preset = 'empty',
      illustration,
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      layout = 'vertical',
      bordered = false,
      ...props
    },
    ref
  ) => {
    const { colors, tokens } = useTheme();

    const illustrationSizeMap: Record<EmptyStateSize, IllustrationSize> = {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
    };

    const headingLevelMap: Record<EmptyStateSize, HeadingLevel> = {
      sm: 4,
      md: 3,
      lg: 2,
    };

    const paddingMap: Record<EmptyStateSize, string> = {
      sm: `${tokens.spacing[6]} ${tokens.spacing[4]}`,
      md: `${tokens.spacing[10]} ${tokens.spacing[6]}`,
      lg: `${tokens.spacing[12]} ${tokens.spacing[8]}`,
    };

    const gapMap: Record<EmptyStateSize, string> = {
      sm: tokens.spacing[3],
      md: tokens.spacing[4],
      lg: tokens.spacing[6],
    };

    const resolvedIllustration =
      illustration !== undefined ? (
        illustration
      ) : (
        <StatusIllustration preset={preset} size={illustrationSizeMap[size]} />
      );

    const isHorizontal = layout === 'horizontal';

    return (
      <div
        ref={ref}
        role="region"
        aria-label={typeof title === 'string' ? title : 'Empty state'}
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: isHorizontal ? 'left' : 'center',
          gap: gapMap[size],
          padding: paddingMap[size],
          maxWidth: tokens.layout.emptyStateMaxWidth[size] || tokens.layout.emptyStateMaxWidth.md,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          borderRadius: bordered ? tokens.radii.xl : undefined,
          border: bordered ? `1px dashed ${colors.border.default}` : undefined,
          backgroundColor: bordered ? colors.bg.surface : 'transparent',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
        }}
        {...props}
      >
        {resolvedIllustration && (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {resolvedIllustration}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isHorizontal ? 'flex-start' : 'center',
            gap: tokens.spacing[2],
            width: '100%',
          }}
        >
          {typeof title === 'string' ? (
            <Heading level={headingLevelMap[size]}>{title}</Heading>
          ) : (
            title
          )}

          {description && (
            <div>
              {typeof description === 'string' ? (
                <Text color="secondary" size={size === 'sm' ? 'sm' : 'base'}>
                  {description}
                </Text>
              ) : (
                description
              )}
            </div>
          )}

          {(action || secondaryAction) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isHorizontal ? 'flex-start' : 'center',
                flexWrap: 'wrap',
                gap: tokens.spacing[3],
                marginTop: tokens.spacing[2],
              }}
            >
              {action}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
