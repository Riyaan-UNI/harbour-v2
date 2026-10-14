import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tab trigger styles, kept out of `tabs.tsx` so that file exports only a
 * component (the fast-refresh rule wants it that way).
 *
 * The selected tab is the only one carrying the border and the stronger
 * surface, so the row reads as one control with a current tab rather than a
 * set of competing buttons. Every trigger keeps the 2.75rem touch target
 * (`min-h-11`) — spec §6 — including the small variant.
 */
export const tabVariants = cva(
  [
    'relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2',
    'rounded-md border border-transparent px-4 type-small font-medium',
    'text-text-muted transition-colors duration-fast',
    'hover:border-border hover:bg-glass-fill hover:text-text',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      selected: {
        true: 'border-border bg-glass-fill-strong text-text',
        false: '',
      },
    },
    defaultVariants: { selected: false },
  },
);

export type TabVariantsProps = VariantProps<typeof tabVariants>;
