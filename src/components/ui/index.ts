/**
 * Shared UI components — Brick 2a.
 *
 * Built on the layout primitives and the token layer only. No component here
 * writes a colour, a px value or an off-scale space; a vendored shadcn file
 * that does is fixed to the §6 table rather than excused from the gate.
 *
 * Brick 2b adds the complex ones: Combobox and CountryCombobox, Dialog and
 * Sheet, Tabs, the progress ring and bar, and the interactive-card effects.
 */
export { Button, type ButtonProps } from './button';
export {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from './button-variants';
export { Input, type InputProps } from './input';
export { Textarea, type TextareaProps } from './textarea';
export { FormField, type FormFieldControlProps, type FormFieldProps } from './form-field';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardDescriptionProps,
  type CardProps,
  type CardSectionProps,
  type CardTitleProps,
} from './card';
export { cardVariants, type CardVariant } from './card-variants';
export {
  InteractiveCard,
  type InteractiveCardProps,
} from './interactive-card';
export { Chip, type ChipProps } from './chip';
export { chipVariants } from './chip-variants';
export { ProgressRing, type ProgressRingProps, type ProgressRingSize } from './progress-ring';
export { StatusBadge, type StatusBadgeProps, type StatusTone } from './status-badge';
export { DemoBadge, type DemoBadgeProps } from './demo-badge';
export {
  demoBadgeVariants,
  type DemoBadgeVariant,
} from './demo-badge-variants';
export { Disclaimer, type DisclaimerProps } from './disclaimer';
export { Skeleton, type SkeletonProps } from './skeleton';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { ErrorState, type ErrorStateProps } from './error-state';
export { Toaster } from './toast';
export { toast } from 'sonner';
export { Sheet, type SheetProps } from './sheet';
export { Avatar, type AvatarProps, type AvatarSize } from './avatar';
export { initialsOf } from './initials';
export {
  UniversityLogo,
  type UniversityLogoProps,
  type UniversityLogoSize,
} from './university-logo';
export {
  UNIVERSITIES,
  UNIVERSITY_IDS,
  UNIVERSITY_LOGO_IDS,
  isUniversityId,
  universityById,
  type University,
  type UniversityId,
} from './university-logos';
export { SafetyRail, type SafetyRailProps } from './safety-rail';
export {
  SAFETY_CONTACTS,
  type SafetyContact,
  type SafetyRailVariant,
} from './safety-contacts';
export { RedactionNotice, type RedactionNoticeProps } from './redaction-notice';
export { HarbourMark, type HarbourMarkProps } from './harbour-mark';
export {
  HarbourLogo,
  type HarbourLogoProps,
  type HarbourLogoSize,
  type HarbourLogoVariant,
} from './harbour-logo';
export * from './icons';
