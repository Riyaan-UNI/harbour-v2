import {
  forwardRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardRefRenderFunction,
  type PropsWithoutRef,
  type ReactElement,
} from 'react';

/**
 * Shared types for the layout primitives — spec §6.
 *
 * Every primitive is polymorphic (`as` prop) and forwards its ref. The types
 * below are the standard polymorphic helpers, written so that:
 *
 *   - `<Stack as="ul">` type-checks and its props are the props of `<ul>`,
 *   - a prop the primitive owns (`gap`, `size`, …) keeps its own type,
 *   - `ref` is typed from the rendered element.
 */

/* -------------------------------------------------------------------------- */
/* Spacing                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The ten spacing steps of spec §6, numbered the way the spec names them.
 *
 * The numbers are NOT Tailwind's steps: spec `space-5` is 1.5rem, which is
 * Tailwind `p-6`. The primitives never expose Tailwind's numbering, so the
 * trap in §6 cannot be walked into from a component.
 */
export type Space = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** A spacing step as a CSS value: `space(5)` is `var(--space-5)`. */
export function space(step: Space): string {
  return `var(--space-${step})`;
}

/* -------------------------------------------------------------------------- */
/* Polymorphism                                                                */
/* -------------------------------------------------------------------------- */

export type AsProp<C extends ElementType> = { as?: C };

/** The rendered element's own props, minus anything the primitive overrides. */
export type PolymorphicProps<C extends ElementType, OwnProps = object> = OwnProps &
  AsProp<C> &
  Omit<ComponentPropsWithRef<C>, keyof OwnProps | 'as'>;

export type PolymorphicRef<C extends ElementType> =
  ComponentPropsWithRef<C>['ref'];

/**
 * The shape a polymorphic `forwardRef` component ends up with: callable with a
 * default element, overridable by `as`, and still carrying `ref`.
 */
export type PolymorphicComponent<Default extends ElementType, OwnProps = object> =
  <C extends ElementType = Default>(
    props: PolymorphicProps<C, OwnProps> & { ref?: PolymorphicRef<C> },
  ) => ReactElement | null;

/**
 * Builds a polymorphic `forwardRef` component from a generic render function.
 *
 * React's `forwardRef` cannot express a generic render function, so the cast is
 * unavoidable — but it is confined to this one function rather than repeated in
 * ten component files. The render function itself stays fully typed; only the
 * hand-off to React is asserted.
 */
export function createPolymorphicComponent<
  Default extends ElementType,
  OwnProps extends object,
>(render: unknown): PolymorphicComponent<Default, OwnProps> {
  const Forwarded = forwardRef<Element, OwnProps>(
    render as ForwardRefRenderFunction<Element, PropsWithoutRef<OwnProps>>,
  );

  return Forwarded as unknown as PolymorphicComponent<Default, OwnProps>;
}
