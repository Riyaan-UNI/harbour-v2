import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * UniversityLogo — spec §8.
 *
 * A square box on a white plate in both themes, radius `md` at 3rem and `sm` at
 * 2rem and 2.5rem. The image is contained, lazily loaded, and its alt text is
 * the full institution name.
 *
 * On a load error — or with no `src` at all — the box shows the acronym in
 * Geist Mono 600 in dark teal on the plate, so there is no layout shift and no
 * broken-image icon. The acronym scales with the box, so a three-letter code
 * still fits at the smallest size.
 *
 * The real logos are not bundled yet. Point `src` at `/logos/<id>.svg` once
 * they are: the acronym fallback already covers a missing file, which is what
 * the gallery's error case proves.
 */
export type UniversityLogoSize = 'sm' | 'md' | 'lg';

/** 2rem / 2.5rem / 3rem, with the radius the spec asks for per size. */
const SIZE: Record<UniversityLogoSize, { box: string; radius: string }> = {
  sm: { box: 'size-8', radius: 'rounded-sm' },
  md: { box: 'size-10', radius: 'rounded-sm' },
  lg: { box: 'size-12', radius: 'rounded-md' },
};

export type UniversityLogoProps = {
  /** e.g. `/logos/hku.svg`. Omit to render the acronym fallback directly. */
  src?: string;
  /** The institution's full name. Used as the alt text. */
  name: string;
  /** The short code shown when the image cannot be shown. */
  acronym: string;
  size?: UniversityLogoSize;
  className?: string;
};

export function UniversityLogo({
  src,
  name,
  acronym,
  size = 'md',
  className,
}: UniversityLogoProps): JSX.Element {
  const [failed, setFailed] = useState(false);

  // A new source deserves a fresh attempt.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = failed || !src;

  return (
    <span
      className={cn(
        'ui-logo inline-grid shrink-0 place-items-center overflow-hidden',
        'border border-border bg-logo-plate p-2',
        SIZE[size].box,
        SIZE[size].radius,
        className,
      )}
      data-size={size}
    >
      {showFallback ? (
        <span className="ui-logo__acronym text-logo-plate-ink">{acronym}</span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
          onError={() => {
            setFailed(true);
          }}
        />
      )}
    </span>
  );
}
