import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card styles, kept out of `card.tsx` so that file exports only components.
 *
 *   static       glass
 *   interactive  glass, with a hover and a focus-visible lift (see ui.css)
 *   flat         a hairline and no glass, so it uses `--border-strong`, the
 *                token held to 3:1 because the border is its only boundary
 */
export const cardVariants = cva('rounded-lg', {
  variants: {
    variant: {
      static: 'glass',
      interactive: 'glass ui-card--interactive',
      flat: 'border border-border-strong',
    },
  },
  defaultVariants: { variant: 'static' },
});

export type CardVariant = NonNullable<
  VariantProps<typeof cardVariants>['variant']
>;
