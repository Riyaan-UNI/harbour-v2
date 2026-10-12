import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Heading, Stack, Text } from '../layout';
import { Button } from './button';
import { RefreshCw } from './icons';

/**
 * ErrorState — Addendum 1 rule 1: the error state is useful. It offers a retry
 * and an offline alternative.
 *
 * The tone is calm ("the app is taking a breather"), never alarming, and the
 * whole block is a polite live region so it is announced when it appears
 * without interrupting whatever the user is doing.
 */
export type ErrorStateProps = {
  title: string;
  children?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  /** What to do without a connection — the deterministic fallback, always offered. */
  offline?: ReactNode;
  className?: string;
};

export function ErrorState({
  title,
  children,
  onRetry,
  retryLabel = 'Try again',
  offline,
  className,
}: ErrorStateProps): JSX.Element {
  return (
    <Stack
      gap={4}
      align="center"
      className={cn('text-center', className)}
      role="status"
      aria-live="polite"
    >
      <Stack gap={2} align="center">
        <Heading level={3}>{title}</Heading>
        {children ? (
          <Text role="small" tone="muted">
            {children}
          </Text>
        ) : null}
      </Stack>

      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw />
          {retryLabel}
        </Button>
      ) : null}

      {offline ? (
        <Text role="small" tone="subtle" className="max-w-measure">
          {offline}
        </Text>
      ) : null}
    </Stack>
  );
}
