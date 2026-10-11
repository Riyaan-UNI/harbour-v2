import type { ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

/**
 * Cq — the container-query wrapper, spec §6.
 *
 * Cards must respond to *their own* width, not the viewport. Wrapping a block
 * in `<Cq>` gives it `container-type: inline-size`, which makes Tailwind v4's
 * container variants resolve against it:
 *
 *   <Cq>
 *     <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">…</div>
 *   </Cq>
 *
 * The variant is `@md:` (container width ≥ 28rem), not `md:` (viewport width).
 * That distinction is the whole point: the same card can be wide inside a
 * narrow viewport.
 */
const CqImpl = <C extends ElementType = 'div'>(
  { as, className, ...rest }: PolymorphicProps<C>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component ref={ref} className={cn('layout-cq', className)} {...rest} />
  );
};

export const Cq = createPolymorphicComponent<'div', object>(CqImpl);
