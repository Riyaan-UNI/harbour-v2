import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button styles, kept out of `button.tsx` so that file exports only a
 * component (the fast-refresh rule wants it that way).
 *
 * Heights: 2.75rem default, 3.25rem large, and 2.25rem small *only* on
 * `(pointer: fine)` — a coarse pointer keeps the 2.75rem touch target.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2',
    'whitespace-nowrap type-small font-medium',
    'rounded-md border transition-colors duration-fast',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-busy:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-accent-fill text-on-accent hover:bg-accent-fill/90 active:bg-accent-fill/75',
        secondary:
          'border-border bg-glass-fill-strong text-text hover:bg-glass-fill active:bg-glass-fill-strong',
        ghost:
          'border-transparent bg-transparent text-text hover:bg-glass-fill-strong active:bg-glass-fill',
        danger:
          'border-transparent bg-danger text-on-accent hover:bg-danger/90 active:bg-danger/75',
      },
      size: {
        default: 'h-11 px-4',
        large: 'h-13 px-6',
        small: 'h-11 px-3 pointer-fine:h-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>;
