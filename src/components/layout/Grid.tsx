import type { CSSProperties, ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  space,
  type PolymorphicProps,
  type PolymorphicRef,
  type Space,
} from './types';

/** Track minimum: sm 14rem, md 17rem (the spec's value), lg 22rem. */
export type GridMin = 'sm' | 'md' | 'lg';

export type GridOwnProps = {
  /** Smallest a track may get before the grid drops a column. Defaults to `md`. */
  min?: GridMin;
  /** Gap between tracks, on both axes. Defaults to 6 (2rem). */
  gap?: Space;
};

const MIN_CLASS: Record<GridMin, string> = {
  sm: 'layout-grid--sm',
  md: 'layout-grid--md',
  lg: 'layout-grid--lg',
};

/**
 * Grid — spec §6.
 *
 * `repeat(auto-fit, minmax(min(100%, X), 1fr))`: as many tracks as fit at X or
 * wider, and never a track that overflows its parent. There are no column
 * counts to remember and no breakpoints to keep in step.
 */
const GridImpl = <C extends ElementType = 'div'>(
  {
    as,
    min = 'md',
    gap = 6,
    className,
    style,
    ...rest
  }: PolymorphicProps<C, GridOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn('layout-grid', MIN_CLASS[min], className)}
      style={{ gap: space(gap), ...style } as CSSProperties}
      {...rest}
    />
  );
};

export const Grid = createPolymorphicComponent<'div', GridOwnProps>(GridImpl);
