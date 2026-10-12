/**
 * The class string shared by Input and Textarea.
 *
 * Both are a field: a 2.75rem-or-taller control with the strong glass fill,
 * a hairline, and a focus ring from the global rule in base.css. Keeping the
 * shared part in one place means the two controls cannot drift apart.
 */
export const fieldBase = [
  'w-full rounded-md border border-border bg-glass-fill-strong',
  'px-4 type-small text-text',
  'transition-colors duration-fast',
  'placeholder:text-text-subtle',
  'hover:border-border-strong',
  'aria-[invalid=true]:border-danger',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');
