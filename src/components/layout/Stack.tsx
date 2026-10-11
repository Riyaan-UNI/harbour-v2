import type { CSSProperties, ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  space,
  type PolymorphicProps,
  type PolymorphicRef,
  type Space,
} from './types';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export type StackOwnProps = {
  /** Gap between children, as a spec §6 step. Defaults to 4 (1rem). */
  gap?: Space;
  /** Cross-axis alignment of the children. */
  align?: StackAlign;
};

const ALIGN_CLASS: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * Stack — spec §6. A column with a gap.
 *
 * The gap is written as var(--space-N), so only the ten spec steps type-check:
 * `gap={5}` is 1.5rem, and `gap="1.5rem"` is a type error.
 */
const StackImpl = <C extends ElementType = 'div'>(
  {
    as,
    gap = 4,
    align,
    className,
    style,
    ...rest
  }: PolymorphicProps<C, StackOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn('flex flex-col', align && ALIGN_CLASS[align], className)}
      style={{ gap: space(gap), ...style } as CSSProperties}
      {...rest}
    />
  );
};

export const Stack = createPolymorphicComponent<'div', StackOwnProps>(StackImpl);
