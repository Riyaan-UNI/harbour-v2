import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Combobox styles, kept out of `combobox.tsx` so that file exports only
 * components (the fast-refresh rule wants it that way).
 *
 * The trigger reuses the field family's look — the same fill, hairline and
 * focus ring the `Input` gets — so a combobox sits in a form beside text
 * inputs without reading as a different control. The open state is expressed
 * as a variant rather than a `data-state` selector so it stays a Tailwind
 * utility like everything else here.
 */
export const comboboxVariants = cva(
  [
    'flex w-full items-center gap-3 rounded-md border border-border',
    'bg-glass-fill-strong px-4 text-left type-small text-text',
    'transition-colors duration-fast',
    'hover:border-border-strong',
    'aria-[invalid=true]:border-danger',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:outline-none',
  ],
  {
    variants: {
      open: {
        true: 'border-border-strong',
        false: '',
      },
    },
    defaultVariants: { open: false },
  },
);

export type ComboboxVariantsProps = VariantProps<typeof comboboxVariants>;
