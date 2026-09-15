import React, { type HTMLAttributes, type ReactNode } from 'react';
import { Stack, type StackGap } from '../Stack/Stack';
import { Heading, type HeadingLevel } from '../Heading/Heading';
import { Text } from '../Text/Text';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className' | 'title'> {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: HeadingLevel;
  gap?: StackGap;
  children: ReactNode;
}

export function Section({
  title,
  description,
  action,
  headingLevel = 2,
  gap = 6,
  children,
  ...props
}: SectionProps) {
  return (
    <section style={{ margin: 0, padding: 0, boxSizing: 'border-box' }} {...props}>
      <Stack gap={gap}>
        <Stack direction="row" align="start" justify="between">
          <Stack gap={1}>
            {typeof title === 'string' ? (
              <Heading level={headingLevel}>{title}</Heading>
            ) : (
              title
            )}
            {description && (
              typeof description === 'string' ? (
                <Text color="secondary">{description}</Text>
              ) : (
                description
              )
            )}
          </Stack>
          {action && <div>{action}</div>}
        </Stack>

        <div>{children}</div>
      </Stack>
    </section>
  );
}
