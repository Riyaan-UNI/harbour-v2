import {
  AlertTriangle as LucideAlertTriangle,
  ArrowRight as LucideArrowRight,
  ArrowUpRight as LucideArrowUpRight,
  CheckCircle as LucideCheckCircle,
  EyeOff as LucideEyeOff,
  GraduationCap as LucideGraduationCap,
  Info as LucideInfo,
  LoaderCircle,
  Menu as LucideMenu,
  Phone as LucidePhone,
  RefreshCw as LucideRefreshCw,
  ShieldAlert as LucideShieldAlert,
  X as LucideX,
  type LucideIcon,
} from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Icons — one module, one wrapper API, `lucide-react` underneath.
 *
 * Brick 2a hand-drew these eight glyphs because spec §2's dependency list has
 * no icon library. The review asked for libraries over hand-coding, so the
 * glyphs are now lucide's (a documented deviation from §2, recorded in
 * docs/PROGRESS.md) and the API is unchanged: same names, same props, same
 * defaults, so no call site had to move.
 *
 * Three rules the wrapper enforces so a caller cannot get them wrong:
 *
 *   - **Sizes stay on the rem scale.** Only `className` sets a size, and the
 *     default is `size-4` (1rem). lucide's own `size` prop is in px, so it is
 *     deliberately not exposed — a caller reaching for `size={18}` gets a type
 *     error rather than an off-scale value.
 *   - **Every icon is `aria-hidden` by default.** An icon here is decoration
 *     beside a label, never the only carrier of meaning (spec §8, Addendum 1
 *     rule 4). Pass `aria-hidden={false}` and a label only when it is not.
 *   - **One stroke weight.** lucide draws on a 24-unit grid; 1.75 is 7.3% of
 *     the box, which is the weight the hand-drawn 16-unit 1.25 strokes had
 *     (7.8%), so nothing got heavier when the library landed.
 */
const DEFAULT_STROKE = 1.75;

export type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'> & {
  /** Sets the size as a rem-scale utility, e.g. `size-6`. Defaults to `size-4`. */
  className?: string;
};

/**
 * Wraps a lucide glyph in the Harbour defaults. `displayName` is set so React
 * DevTools and a test failure both name the icon rather than "ForwardRef".
 */
function createIcon(Icon: LucideIcon, displayName: string) {
  const Component = forwardRef<SVGSVGElement, IconProps>(function IconComponent(
    { className, strokeWidth, ...rest },
    ref,
  ) {
    return (
      <Icon
        ref={ref}
        className={cn('size-4', className)}
        strokeWidth={strokeWidth ?? DEFAULT_STROKE}
        aria-hidden="true"
        focusable="false"
        {...rest}
      />
    );
  });

  Component.displayName = displayName;
  return Component;
}

/** The loading spinner. Motion is a rotation, and it stops under reduced motion. */
export function Spinner({ className }: IconProps): JSX.Element {
  return (
    <LoaderCircle
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      strokeWidth={DEFAULT_STROKE}
      aria-hidden="true"
      focusable="false"
    />
  );
}

/** Amber risk, and a general warning. */
export const AlertTriangle = createIcon(LucideAlertTriangle, 'AlertTriangle');

/** Red risk — the highest band. */
export const ShieldAlert = createIcon(LucideShieldAlert, 'ShieldAlert');

/** Green — a clear or safe result. */
export const CheckCircle = createIcon(LucideCheckCircle, 'CheckCircle');

/** Info — neutral guidance, never a verdict. */
export const InfoCircle = createIcon(LucideInfo, 'InfoCircle');

/** Retry, in the error state. */
export const RefreshCw = createIcon(LucideRefreshCw, 'RefreshCw');

/** A tappable telephone number. */
export const Phone = createIcon(LucidePhone, 'Phone');

/** Hidden identifiers, in the redaction notice. */
export const EyeOff = createIcon(LucideEyeOff, 'EyeOff');

/** An external link, so a link never relies on colour alone. */
export const ArrowUpRight = createIcon(LucideArrowUpRight, 'ArrowUpRight');

/** Forward motion — a call to action that moves on. */
export const ArrowRight = createIcon(LucideArrowRight, 'ArrowRight');

/** The mobile menu trigger. Always paired with a label or an aria-label. */
export const MenuIcon = createIcon(LucideMenu, 'MenuIcon');

/** Close. Always paired with a label or an aria-label. */
export const CloseIcon = createIcon(LucideX, 'CloseIcon');

/** The generic mark for a university box with no bundled logo file. */
export const GraduationCap = createIcon(LucideGraduationCap, 'GraduationCap');
