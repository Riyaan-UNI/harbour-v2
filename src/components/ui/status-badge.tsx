import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AlertTriangle, CheckCircle, InfoCircle, ShieldAlert } from './icons';

/**
 * StatusBadge — spec §8 and Addendum 1 rule 4.
 *
 * A risk level is never colour alone: every badge carries a colour, an icon
 * and a label. The four tones map onto existing tokens —
 *
 *   red    --danger        the highest band
 *   amber  --gold-text     caution
 *   green  --success       clear
 *   info   --accent-text   neutral guidance, never a verdict
 *
 * The tone sets `--badge-tone`; the surface and border are mixed from it in
 * ui.css, so one semantic colour drives the whole badge and nothing new is
 * invented per tone.
 */

export type StatusTone = 'red' | 'amber' | 'green' | 'info';

const TONES: Record<
  StatusTone,
  { token: string; Icon: ComponentType<{ className?: string }>; label: string }
> = {
  red: { token: 'var(--danger)', Icon: ShieldAlert, label: 'High risk' },
  amber: { token: 'var(--gold-text)', Icon: AlertTriangle, label: 'Caution' },
  green: { token: 'var(--success)', Icon: CheckCircle, label: 'Clear' },
  info: { token: 'var(--accent-text)', Icon: InfoCircle, label: 'Note' },
};

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  tone: StatusTone;
  /** Overrides the default label for the tone. */
  children?: ReactNode;
};

export function StatusBadge({
  tone,
  className,
  children,
  ...rest
}: StatusBadgeProps): JSX.Element {
  const { token, Icon, label } = TONES[tone];

  return (
    <span
      className={cn(
        'ui-badge inline-flex items-center gap-2 rounded-pill border px-3 py-1 type-label',
        className,
      )}
      style={{ '--badge-tone': token } as CSSProperties}
      {...rest}
    >
      <Icon />
      {children ?? label}
    </span>
  );
}
