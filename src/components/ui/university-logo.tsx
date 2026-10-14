import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { GraduationCap } from './icons';
import { universityById, type UniversityId } from './university-logos';

/**
 * UniversityLogo — spec §8.
 *
 * A square box on a white plate in both themes, radius `md` at 3rem and `sm` at
 * 2rem and 2.5rem. The image is contained, lazily loaded, and its alt text is
 * the full institution name.
 *
 * **Two variants.** The default `mark` is the plain institutional mark — what
 * identifies the institution and what alt text describes. The `art` variant
 * uses the bundled concept-art SVG instead: a coloured field with orbital
 * rings, a near-white bed, and the mark on top. Art is decorative — the
 * institution is already named in nearby text — so the box drops its white
 * plate, removes the border, and the image itself carries the colour. The
 * art SVG is `prefers-reduced-motion: reduce`-aware: motion users see a
 * slowly rotating / breathing composition, reduced-motion users see the same
 * composition static, so the variant is safe at every preference.
 *
 * **Where the file comes from.** Pass `id` and the name, acronym and paths
 * are resolved from the typed manifest in `university-logos.ts`, so a signup
 * dropdown cannot drift out of step with the spec's table. Passing `src`,
 * `name` and `acronym` directly is still supported for a one-off box (the
 * gallery uses that form to show the error case on purpose).
 *
 * **Three fallbacks, all without a layout shift.** A load error, or no `src`
 * at all, swaps the image for the acronym in Geist Mono 600, dark teal on the
 * plate. An entry with no acronym (`other`) shows a generic graduation-cap mark
 * instead. Both fallbacks are sized in container units, so a three-letter code
 * fits at 2rem and at 3rem without a per-size font size, and the box never
 * changes size when the swap happens. The art variant does not fall back to
 * the acronym — when the art is missing the box swaps to the plain mark.
 */
export type UniversityLogoSize = 'sm' | 'md' | 'lg';

/** 2rem / 2.5rem / 3rem, with the radius the spec asks for per size. */
const SIZE: Record<UniversityLogoSize, { box: string; radius: string }> = {
  sm: { box: 'size-8', radius: 'rounded-sm' },
  md: { box: 'size-10', radius: 'rounded-sm' },
  lg: { box: 'size-12', radius: 'rounded-md' },
};

type SharedProps = {
  size?: UniversityLogoSize;
  className?: string;
  /**
   * `mark` (default) is the plain institutional mark on a white plate.
   * `art` swaps in the bundled concept-art SVG with no plate and no border —
   * for surfaces where the institution is already named in nearby text and
   * the mark is decorative colour, not identification.
   */
  variant?: 'mark' | 'art';
};

/**
 * Either name an institution by id, or spell out the three fields. `id` alone
 * is the common case; `name` + `acronym` is the escape hatch. A box with
 * neither a name nor an id cannot be built, which is what keeps `alt` from
 * silently becoming empty.
 */
export type UniversityLogoProps = SharedProps &
  (
    | { id: UniversityId; src?: string; name?: string; acronym?: string }
    | { id?: undefined; src?: string; name: string; acronym: string }
  );

export function UniversityLogo({
  id,
  src,
  name,
  acronym,
  size = 'md',
  variant = 'mark',
  className,
}: UniversityLogoProps): JSX.Element {
  const [failed, setFailed] = useState(false);

  const entry = id === undefined ? undefined : universityById(id);

  const resolvedName = name ?? entry?.name ?? '';
  const resolvedAcronym = acronym ?? entry?.acronym ?? '';
  const markSrc = src ?? entry?.logo ?? undefined;
  const artSrc = variant === 'art' ? (src ?? entry?.art ?? undefined) : undefined;

  // A new source deserves a fresh attempt.
  useEffect(() => {
    setFailed(false);
  }, [markSrc, artSrc]);

  const isArt = variant === 'art' && Boolean(artSrc);
  const activeSrc = isArt ? artSrc : markSrc;
  const showFallback = failed || !activeSrc;

  // The art variant drops the white plate and the border — the SVG carries its
  // own coloured field and white bed, so a plate around it would just clip the
  // colour. The size tokens are kept on the box in both variants so an art box
  // swaps cleanly for a mark box in the same row without a layout shift.
  return (
    <span
      className={cn(
        'ui-logo inline-grid shrink-0 place-items-center overflow-hidden',
        isArt ? 'ui-logo--art' : cn('border border-border bg-logo-plate p-2', SIZE[size].radius),
        SIZE[size].box,
        className,
      )}
      data-size={size}
      data-variant={variant}
      data-university-id={id}
    >
      {showFallback ? (
        isArt && entry?.logo ? (
          // Art asked for, but the art SVG failed (or this entry has none).
          // Fall back to the plain mark — the institution still needs to be
          // identifiable. Keeps the white plate off, since the art surround
          // carries its own bed.
          <img
            src={entry.logo}
            alt={resolvedName}
            loading="lazy"
            decoding="async"
            className="size-full object-contain"
          />
        ) : resolvedAcronym ? (
          <span className="ui-logo__acronym text-logo-plate-ink">
            {resolvedAcronym}
          </span>
        ) : (
          <span className="ui-logo__mark text-logo-plate-ink">
            <GraduationCap className="size-full" />
          </span>
        )
      ) : isArt ? (
        // Decorative — the institution is named in nearby text.
        <img
          src={activeSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="ui-logo__art size-full"
        />
      ) : (
        <img
          src={activeSrc}
          alt={resolvedName}
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
