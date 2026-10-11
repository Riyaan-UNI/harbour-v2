import type { ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

export type ContainerSize = 'page' | 'measure' | 'narrow';

export type ContainerOwnProps = {
  /**
   * `page` 75rem, `measure` 65ch (spec §5), `narrow` 28rem (spec §10).
   * Defaults to `page`.
   */
  size?: ContainerSize;
};

const SIZE_CLASS: Record<ContainerSize, string> = {
  page: 'layout-container--page',
  measure: 'layout-container--measure',
  narrow: 'layout-container--narrow',
};

/**
 * Container — spec §6.
 *
 * Centres a block at one of the three widths the spec defines and applies the
 * container padding-inline token, which steps 1rem → 1.5rem at 40em → 2rem at
 * 64em on the token itself.
 */
const ContainerImpl = <C extends ElementType = 'div'>(
  {
    as,
    size = 'page',
    className,
    ...rest
  }: PolymorphicProps<C, ContainerOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn('layout-container', SIZE_CLASS[size], className)}
      {...rest}
    />
  );
};

export const Container = createPolymorphicComponent<'div', ContainerOwnProps>(
  ContainerImpl,
);
