import { Cluster, Stack, VisuallyHidden } from '../layout';
import { Phone } from './icons';
import { SAFETY_CONTACTS, type SafetyRailVariant } from './safety-contacts';

/**
 * SafetyRail — Addendum 1 rule 3. The safety numbers, one tap away, on every
 * signed-in surface. The numbers themselves, and their provenance, are in
 * `safety-contacts.ts`.
 *
 * `compact` is a wrapping row of tappable pills for a bar; `expanded` is a list
 * with the name and the detail for a page. Both are real `tel:` links at the
 * 2.75rem touch target, and both carry an accessible name so a screen reader
 * hears "Emergency services: 999" rather than a bare number.
 */
export type SafetyRailProps = {
  variant?: SafetyRailVariant;
  /**
   * The landmark's accessible name. Two rails on one page must not share a
   * name — a screen reader lists landmarks by name, and axe's `landmark-unique`
   * flags the duplicate — so the default differs per variant and a caller can
   * override it.
   */
  label?: string;
  className?: string;
};

export function SafetyRail({
  variant = 'compact',
  label,
  className,
}: SafetyRailProps): JSX.Element {
  const name =
    label ??
    (variant === 'compact'
      ? 'Emergency and support numbers'
      : 'Emergency and support numbers, with details');

  if (variant === 'compact') {
    return (
      <Cluster as="nav" gap={2} aria-label={name} className={className}>
        {SAFETY_CONTACTS.map((contact) => (
          <a
            key={contact.id}
            href={`tel:${contact.tel}`}
            aria-label={`${contact.name}: ${contact.number}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-glass-fill-strong px-3 type-label text-text transition-colors duration-fast hover:bg-glass-fill"
          >
            <Phone />
            {contact.number}
          </a>
        ))}
      </Cluster>
    );
  }

  return (
    <Stack as="nav" gap={2} aria-label={name} className={className}>
      <VisuallyHidden as="h2">{name}</VisuallyHidden>
      {SAFETY_CONTACTS.map((contact) => (
        <a
          key={contact.id}
          href={`tel:${contact.tel}`}
          className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-glass-fill-strong px-4 py-2 transition-colors duration-fast hover:bg-glass-fill"
        >
          <Phone className="size-4 shrink-0 text-accent-text" />
          <span className="flex min-w-0 flex-col">
            <span className="type-small text-text">{contact.name}</span>
            <span className="type-small text-text-muted">{contact.detail}</span>
          </span>
          <span className="type-label text-accent-text ms-auto shrink-0">
            {contact.number}
          </span>
        </a>
      ))}
    </Stack>
  );
}
