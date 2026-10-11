/**
 * Layout primitives — spec §6.
 *
 * Every primitive is polymorphic (`as`), forwards its ref, and takes its
 * spacing from the ten spec §6 steps. Nothing here sets an outer margin, and
 * nothing here writes a font size except Heading and Text, which are the two
 * components that exist to own the type roles.
 */
export { Container, type ContainerOwnProps, type ContainerSize } from './Container';
export { Section, type SectionOwnProps } from './Section';
export { Stack, type StackAlign, type StackOwnProps } from './Stack';
export {
  Cluster,
  type ClusterAlign,
  type ClusterJustify,
  type ClusterOwnProps,
} from './Cluster';
export { Grid, type GridMin, type GridOwnProps } from './Grid';
export {
  Bento,
  BentoItem,
  type BentoItemOwnProps,
  type BentoOwnProps,
  type BentoSize,
} from './Bento';
export { Heading, type HeadingLevel, type HeadingOwnProps, type HeadingRole } from './Heading';
export { Text, type TextOwnProps, type TextRole, type TextTone } from './Text';
export { VisuallyHidden } from './VisuallyHidden';
export { Cq } from './Cq';
export { space, type Space } from './types';
