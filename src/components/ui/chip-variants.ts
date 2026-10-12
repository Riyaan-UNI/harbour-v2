import { cva } from 'class-variance-authority';

/** Chip styles, kept out of `chip.tsx` so that file exports only a component. */
export const chipVariants = cva(
  'inline-flex items-center gap-2 rounded-pill border px-3 py-1 type-small',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-glass-fill-strong text-text',
        accent: 'border-transparent bg-accent-fill text-on-accent',
        gold: 'border-transparent bg-gold-fill text-on-gold',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);
