import type { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Container } from './Container';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

export type SectionOwnProps = {
  /**
   * Wrap the children in a page-width Container. On by default; turn it off
   * when the section should manage its own layout, or nest a Container with a
   * different `size`.
   */
  contained?: boolean;
  /** Declared explicitly so the polymorphic props stay resolvable. */
  children?: ReactNode;
};

/**
 * Section — spec §6.
 *
 * Applies the section padding-block token and a scroll-margin, so a sticky nav
 * does not cover the heading of the section it links to. Pass `id` to make it
 * a nav target.
 */
const SectionImpl = <C extends ElementType = 'section'>(
  {
    as,
    contained = true,
    className,
    children,
    ...rest
  }: PolymorphicProps<C, SectionOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn('layout-section', className)}
      {...rest}
    >
      {contained ? <Container>{children}</Container> : children}
    </Component>
  );
};

export const Section = createPolymorphicComponent<'section', SectionOwnProps>(
  SectionImpl,
);
