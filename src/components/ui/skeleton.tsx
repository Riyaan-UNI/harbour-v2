import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/**
 * Skeleton — the loading state. A calm shimmer, never a spinner (Addendum 1
 * rule 1).
 *
 * The sweep is a transform on a pseudo-element, so it never touches layout, and
 * it is removed entirely under reduced motion, leaving a static block. The
 * skeleton is `aria-hidden`: the loading region announces itself with
 * `aria-busy`, and a screen reader should not hear a dozen empty boxes.
 */
export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps): JSX.Element {
  return (
    <div className={cn('ui-skeleton h-4', className)} aria-hidden="true" {...rest} />
  );
}
