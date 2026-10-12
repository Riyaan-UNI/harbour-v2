import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { chipVariants } from './chip-variants';

/**
 * Chip — a small pill for a short label: a filter, a tag, a suggested phrase.
 *
 * Not interactive by itself. Where a chip is a link or a button, pass
 * `asChild` and give it the element, so it keeps the element's own semantics
 * rather than pretending to be one.
 */
export type ChipProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof chipVariants> & {
    asChild?: boolean;
    children?: ReactNode;
  };

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  { className, variant, asChild = false, children, ...rest },
  ref,
) {
  const Component = asChild ? Slot : 'span';
  return (
    <Component
      ref={ref}
      className={cn(chipVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Component>
  );
});
