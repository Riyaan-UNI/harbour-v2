import type { ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

/**
 * VisuallyHidden — available to assistive technology, invisible on screen.
 *
 * Used for the accessible name of an icon-only control, for a heading that
 * labels a landmark, and for the "skip to content" link before it takes focus.
 * The `sr-only` utility is Tailwind's, which keeps the clip-path in one place.
 */
const VisuallyHiddenImpl = <C extends ElementType = 'span'>(
  { as, className, ...rest }: PolymorphicProps<C>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'span') as ElementType;

  return <Component ref={ref} className={cn('sr-only', className)} {...rest} />;
};

export const VisuallyHidden = createPolymorphicComponent<'span', object>(
  VisuallyHiddenImpl,
);
