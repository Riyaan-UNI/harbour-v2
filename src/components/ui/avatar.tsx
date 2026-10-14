import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { initialsOf } from './initials';

/**
 * Avatar — spec §8: one or two initials on a chart colour at 20% alpha, with
 * the text token on top.
 *
 * The colour is a chart token, chosen by `tone` (1 to 5, wrapping), so the same
 * person keeps the same colour and no per-person colour is invented. The
 * initials are decoration when a name is already on screen, so the avatar is
 * `aria-hidden` unless it is given a `label`.
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
};

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  /** The full name. The initials are taken from it. */
  name: string;
  /** Chart token 1 to 5. Defaults to 1. Wraps, so any integer is safe. */
  tone?: number;
  size?: AvatarSize;
  /** Give the avatar an accessible name. Omit it beside a visible name. */
  label?: string;
  /**
   * An image source — the mascot avatars (dashboard module 6). Additive: when
   * present the avatar renders as an `<img>` with the same `.ui-avatar`
   * geometry (square, pill radius, `object-fit: cover`), and `alt` is the name
   * unless an explicit `label` is given. When absent, the initials span renders
   * exactly as it always has — no existing path changes.
   */
  src?: string;
};

/** One or two initials on a 20% chart colour, with the text token on top. */
export function Avatar({
  name,
  tone = 1,
  size = 'md',
  label,
  src,
  className,
  ...rest
}: AvatarProps): JSX.Element {
  const chartIndex = (((Math.trunc(tone) - 1) % 5) + 5) % 5 + 1;
  const toneStyle = {
    '--avatar-tone': `var(--chart-${chartIndex})`,
  } as CSSProperties;

  if (src) {
    return (
      <img
        className={cn(
          'ui-avatar shrink-0 rounded-pill object-cover aspect-square',
          SIZE_CLASS[size],
          className,
        )}
        style={toneStyle}
        src={src}
        alt={label ?? name}
        {...(rest as HTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  return (
    <span
      className={cn(
        'ui-avatar inline-grid shrink-0 place-items-center rounded-pill type-label',
        SIZE_CLASS[size],
        className,
      )}
      style={toneStyle}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      {...rest}
    >
      {initialsOf(name)}
    </span>
  );
}
