import type { CSSProperties, ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  space,
  type PolymorphicProps,
  type PolymorphicRef,
  type Space,
} from './types';

export type BentoSize = 'third' | 'half' | 'twothirds' | 'full';

export type BentoOwnProps = {
  /** Gap between items, on both axes. Defaults to 6 (2rem). */
  gap?: Space;
};

export type BentoItemOwnProps = {
  /**
   * How many columns the item takes at each stage. Defaults to `full`.
   *
   * 1 column — every size takes 1.
   * 2 columns — third and half take 1; twothirds and full take 2.
   * 12 columns — third 4, half 6, twothirds 8, full 12.
   */
  size?: BentoSize;
  /** Take two rows, from 64em. */
  tall?: boolean;
};

const SIZE_CLASS: Record<BentoSize, string> = {
  third: 'layout-bento__item--third',
  half: 'layout-bento__item--half',
  twothirds: 'layout-bento__item--twothirds',
  full: 'layout-bento__item--full',
};

/**
 * Bento — spec §6. 12 columns from 64em, 2 from 40em, 1 below.
 *
 * The column count is the grid's; an item's span is the item's. They are
 * separate props on separate components on purpose, so a 12-column layout does
 * not need twelve children.
 */
const BentoImpl = <C extends ElementType = 'div'>(
  {
    as,
    gap = 6,
    className,
    style,
    ...rest
  }: PolymorphicProps<C, BentoOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn('layout-bento', className)}
      style={{ gap: space(gap), ...style } as CSSProperties}
      {...rest}
    />
  );
};

export const Bento = createPolymorphicComponent<'div', BentoOwnProps>(BentoImpl);

const BentoItemImpl = <C extends ElementType = 'div'>(
  {
    as,
    size = 'full',
    tall = false,
    className,
    ...rest
  }: PolymorphicProps<C, BentoItemOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn(
        'layout-bento__item',
        SIZE_CLASS[size],
        tall && 'layout-bento__item--tall',
        className,
      )}
      {...rest}
    />
  );
};

export const BentoItem = createPolymorphicComponent<'div', BentoItemOwnProps>(
  BentoItemImpl,
);
