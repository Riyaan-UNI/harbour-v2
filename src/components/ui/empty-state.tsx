import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Heading, Stack, Text } from '../layout';

/**
 * EmptyState — Addendum 1 rule 1: the empty state is warm and has a call to
 * action. Never a blank panel, never a shrug.
 *
 * `action` is a slot rather than a prop that takes a Button, so the caller
 * decides whether the next step is a button, a link or a pair of both.
 */
export type EmptyStateProps = {
  title: string;
  children?: ReactNode;
  /** The call to action. Required in spirit: an empty state offers a next step. */
  action?: ReactNode;
  /** An illustration or icon above the title. */
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  children,
  action,
  icon,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <Stack gap={4} align="center" className={cn('text-center', className)}>
      {icon}
      <Stack gap={2} align="center">
        <Heading level={3}>{title}</Heading>
        {children ? (
          <Text role="small" tone="muted">
            {children}
          </Text>
        ) : null}
      </Stack>
      {action}
    </Stack>
  );
}
