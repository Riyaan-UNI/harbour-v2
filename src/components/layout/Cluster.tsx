import type { CSSProperties, ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  space,
  type PolymorphicProps,
  type PolymorphicRef,
  type Space,
} from './types';

export type ClusterJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

export type ClusterAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export type ClusterOwnProps = {
  /** Gap between items, on both axes. Defaults to 4 (1rem). */
  gap?: Space;
  /** Main-axis distribution. Defaults to `start`. */
  justify?: ClusterJustify;
  /** Cross-axis alignment. Defaults to `center`. */
  align?: ClusterAlign;
};

const JUSTIFY_CLASS: Record<ClusterJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const ALIGN_CLASS: Record<ClusterAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

/**
 * Cluster — spec §6. A wrapping row with a gap.
 *
 * Items that do not fit on one line wrap, which is what makes it safe at 320px
 * without a media query.
 */
const ClusterImpl = <C extends ElementType = 'div'>(
  {
    as,
    gap = 4,
    justify = 'start',
    align = 'center',
    className,
    style,
    ...rest
  }: PolymorphicProps<C, ClusterOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn(
        'flex flex-wrap',
        JUSTIFY_CLASS[justify],
        ALIGN_CLASS[align],
        className,
      )}
      style={{ gap: space(gap), ...style } as CSSProperties}
      {...rest}
    />
  );
};

export const Cluster = createPolymorphicComponent<'div', ClusterOwnProps>(
  ClusterImpl,
);
