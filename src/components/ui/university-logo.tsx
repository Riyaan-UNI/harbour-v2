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
 * **Where the file comes from.** Pass `id` and the name, acronym and path are
 * resolved from the typed manifest in `university-logos.ts`, so a signup
 * dropdown cannot drift out of step with the spec's table. Passing `src`,
 * `name` and `acronym` directly is still supported for a one-off box (the
 * gallery uses that form to show the error case on purpose).
 *
 * **Three fallbacks, all without a layout shift.** A load error, or no `src` at
 * all, swaps the image for the acronym in Geist Mono 600, dark teal on the
 * plate. An entry with no acronym (`other`) shows a generic graduation-cap mark
 * instead. Both fallbacks are sized in container units, so a three-letter code
 * fits at 2rem and at 3rem without a per-size font size, and the box never
 * changes size when the swap happens.
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
  className,
}: UniversityLogoProps): JSX.Element {
  const [failed, setFailed] = useState(false);

  const entry = id === undefined ? undefined : universityById(id);

  const resolvedName = name ?? entry?.name ?? '';
  const resolvedAcronym = acronym ?? entry?.acronym ?? '';
  const resolvedSrc = src ?? entry?.logo ?? undefined;

  // A new source deserves a fresh attempt.
  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  const showFallback = failed || !resolvedSrc;

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
      data-university-id={id}
    >
      {showFallback ? (
        resolvedAcronym ? (
          <span className="ui-logo__acronym text-logo-plate-ink">
            {resolvedAcronym}
          </span>
        ) : (
          <span className="ui-logo__mark text-logo-plate-ink">
            <GraduationCap className="size-full" />
          </span>
        )
      ) : (
        <img
          src={resolvedSrc}
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
