/**
 * Initials for an avatar. Kept out of `avatar.tsx` so that file exports only a
 * component.
 *
 * One initial for a single word, two for a name — never more than two, so the
 * glyphs stay legible at 2rem.
 */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) return '?';

  const first = words[0] ?? '';
  if (words.length === 1) return first.slice(0, 2).toUpperCase();

  const last = words[words.length - 1] ?? '';
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
