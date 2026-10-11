import type { ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The four visual heading roles in spec §5. */
export type HeadingRole = 'display' | 'h1' | 'h2' | 'h3';

export type HeadingOwnProps = {
  /** The element's rank in the outline. Nothing to do with its size. */
  level: HeadingLevel;
  /**
   * The visual size. Defaults to the matching role for levels 1 to 3, and to
   * `h3` below that.
   *
   * `level` and `role` are deliberately separate: a document outline often
   * needs an `h2` that reads like a display, or an `h3` that must not shrink.
   * The default only spares you writing the common case.
   */
  role?: HeadingRole;
};

const ROLE_CLASS: Record<HeadingRole, string> = {
  display: 'type-display',
  h1: 'type-h1',
  h2: 'type-h2',
  h3: 'type-h3',
};

const DEFAULT_ROLE: Record<HeadingLevel, HeadingRole> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h3',
  5: 'h3',
  6: 'h3',
};

/**
 * Heading — the only place a heading size may be set.
 *
 * The rendered element is `h{level}` unless `as` overrides it. All six heading
 * elements share one prop type and one ref type, so the `as` prop is typed
 * against `h2` and stays correct for any level.
 */
const HeadingImpl = <C extends ElementType = 'h2'>(
  {
    as,
    level,
    role = DEFAULT_ROLE[level],
    className,
    ...rest
  }: PolymorphicProps<C, HeadingOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? `h${level}`) as ElementType;

  return (
    <Component
      ref={ref}
      className={cn(ROLE_CLASS[role], 'text-text', className)}
      {...rest}
    />
  );
};

export const Heading = createPolymorphicComponent<'h2', HeadingOwnProps>(
  HeadingImpl,
);
