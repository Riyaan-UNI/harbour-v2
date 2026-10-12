import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './button-variants';
import { Spinner } from './icons';

/**
 * Button — spec §8.
 *
 * Variants: primary (accent-fill / on-accent), secondary (glass fill with a
 * hairline), ghost, danger. Heights and the small-on-fine-pointer rule live in
 * `button-variants.ts`.
 *
 * States: hover, active, focus-visible (from the global rule in base.css),
 * disabled and loading. Loading keeps the button's width: the label stays in
 * the layout, made invisible, and the spinner is centred over it, so nothing
 * reflows when a request starts.
 *
 * `asChild` renders the styles onto a single child (a router Link, say) via
 * Radix's Slot. That path is a separate return, because Slot requires exactly
 * one element child and the loading markup would be a second one.
 */

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Swap the label for a centred spinner without changing the width. */
    loading?: boolean;
    /** Render the styles onto the single child instead of a <button>. */
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      loading = false,
      asChild = false,
      disabled,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          aria-disabled={disabled || undefined}
          {...rest}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        // A loading button is inert but keeps its place in the tab order.
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        type={type}
        {...rest}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2',
            // opacity, not visibility: a hidden label would take the button's
            // accessible name with it, and axe fails `button-name` (critical)
            // on a button with no name.
            loading && 'opacity-0',
          )}
        >
          {children}
        </span>
        {loading ? (
          <span className="absolute inset-0 grid place-items-center">
            <Spinner />
          </span>
        ) : null}
      </button>
    );
  },
);
