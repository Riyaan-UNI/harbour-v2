import { cva, type VariantProps } from 'class-variance-authority';

/**
 * DemoBadge styles, kept out of `demo-badge.tsx` so that file exports only a
 * component. The label is the variant name, so the word is always on screen.
 */
export const demoBadgeVariants = cva(
  'inline-flex items-center gap-2 rounded-pill border border-border bg-glass-fill-strong px-3 py-1 type-label',
  {
    variants: {
      variant: {
        simulation: 'text-gold-text',
        demo: 'text-accent-text',
        sample: 'text-text-muted',
      },
    },
    defaultVariants: { variant: 'sample' },
  },
);

export type DemoBadgeVariant = NonNullable<
  VariantProps<typeof demoBadgeVariants>['variant']
>;
