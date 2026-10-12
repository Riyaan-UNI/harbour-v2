import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  demoBadgeVariants,
  type DemoBadgeVariant,
} from './demo-badge-variants';
import { EyeOff, InfoCircle } from './icons';

/**
 * DemoBadge — the honesty label, Addendum 1 rule 2.
 *
 * Every simulation, sample and degraded result carries one of these, and it is
 * permanent: it is never dismissed, and a degraded result is never shown as a
 * full one. The label is the variant name, uppercased by the label type role,
 * so the word "SIMULATION" is always literally on screen.
 *
 *   simulation  no real call, no real money, no real person
 *   demo        canned output, no live model
 *   sample      fictional data, shown to illustrate a shape
 */
export type DemoBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant: DemoBadgeVariant;
  /** Extra context after the label, e.g. "no call is placed". */
  children?: ReactNode;
};

const ICONS: Record<
  DemoBadgeVariant,
  (props: { className?: string }) => JSX.Element
> = {
  simulation: EyeOff,
  demo: InfoCircle,
  sample: InfoCircle,
};

export function DemoBadge({
  variant,
  className,
  children,
  ...rest
}: DemoBadgeProps): JSX.Element {
  const Icon = ICONS[variant];
  return (
    <span className={cn(demoBadgeVariants({ variant }), className)} {...rest}>
      <Icon />
      <span>{variant}</span>
      {children ? (
        <span className="text-text-muted normal-case">· {children}</span>
      ) : null}
    </span>
  );
}
