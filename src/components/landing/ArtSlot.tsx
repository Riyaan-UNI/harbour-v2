import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Stack, Text } from '../layout';

/**
 * ArtSlot — the box the concept art will live in.
 *
 * The reference for the art is flat isometric vector with grainy gradients:
 * city blocks and stairs, no harbour or portal scene (the brief rules those
 * out). None of it exists yet, so this component's job right now is to hold the
 * space at the right shape and be obviously empty rather than quietly wrong.
 *
 * Empty, it is a token gradient plus the shared grain — no raw colour, no
 * invented illustration — and it says what it is on screen, so a reviewer never
 * has to guess whether a blank box is a bug.
 *
 * `priority` decides whether the image is eager or lazy. The hero's art is the
 * only thing above the fold, so it passes `priority`; everything else stays
 * lazy. (React 18 does not expose `fetchPriority` as a typed prop, so the
 * hint is `loading` + `decoding` rather than a fetch priority.)
 */
type SharedProps = {
  /** A CSS aspect ratio, e.g. `4 / 3`. Defaults to `4 / 3`. */
  ratio?: string;
  /** Above the fold: load eagerly rather than lazily. */
  priority?: boolean;
  className?: string;
};

export type ArtSlotProps = SharedProps &
  (
    | { src: string; alt: string; children?: never }
    | { src?: undefined; alt?: string; children?: ReactNode }
  );

export function ArtSlot({
  src,
  alt,
  children,
  priority = false,
  ratio = '4 / 3',
  className,
}: ArtSlotProps): JSX.Element {
  const filled = Boolean(src) || children !== undefined;

  return (
    <div
      className={cn('art-slot', !filled && 'art-slot--empty', className)}
      style={{ aspectRatio: ratio }}
      data-empty={filled ? 'false' : 'true'}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ''}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className="size-full object-contain"
        />
      ) : null}

      {children}

      {filled ? null : (
        <div className="art-slot__plate">
          <div className="aurora-noise" aria-hidden="true" />
          <Stack gap={2} align="center">
            <Text role="label" tone="muted">
              Art slot
            </Text>
            <Text role="small" tone="muted">
              The concept art goes here. This is a token gradient and grain, not
              a drawing.
            </Text>
          </Stack>
        </div>
      )}
    </div>
  );
}
