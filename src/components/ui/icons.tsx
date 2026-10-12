import type { SVGProps } from 'react';

/**
 * Inline SVG icons.
 *
 * Spec §2 lists the dependencies and lucide-react is not one of them, so the
 * handful of glyphs these components need are hand-drawn here. Every icon
 * inherits `currentColor` and takes a size class, so it picks up the token
 * colour of whatever it sits in and never needs a colour of its own.
 *
 * All are `aria-hidden` by default: an icon here is decoration beside a label,
 * never the only carrier of meaning (spec §8 and Addendum 1 rule 4).
 */

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Icon({ className = 'size-4', children, ...rest }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** The loading spinner. Motion is a transform, and it stops under reduced motion. */
export function Spinner({ className = 'size-4' }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`${className} animate-spin motion-reduce:animate-none`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.25" opacity="0.25" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" />
    </svg>
  );
}

/** Amber risk, and a general warning. */
export function AlertTriangle(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M8 1.75 14.5 13.25H1.5L8 1.75Z" />
      <path d="M8 6.25v3" />
      <path d="M8 11.4v.1" />
    </Icon>
  );
}

/** Red risk — the highest band. */
export function ShieldAlert(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M8 1.5 13.5 3.5v4c0 3-2.3 5.6-5.5 6.9-3.2-1.3-5.5-3.9-5.5-6.9v-4L8 1.5Z" />
      <path d="M8 5.5v3" />
      <path d="M8 10.6v.1" />
    </Icon>
  );
}

/** Green — a clear or safe result. */
export function CheckCircle(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.25 8.25 7.1 10.1l3.65-3.9" />
    </Icon>
  );
}

/** Info — neutral guidance, never a verdict. */
export function InfoCircle(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.9v.1" />
    </Icon>
  );
}

/** Retry, in the error state. */
export function RefreshCw(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M13.5 8a5.5 5.5 0 1 1-1.9-4.15" />
      <path d="M13.75 2.5v3.25H10.5" />
    </Icon>
  );
}

/** A tappable telephone number. */
export function Phone(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4.25 2.25h2l1 2.5-1.25 1a7.5 7.5 0 0 0 3.5 3.5l1-1.25 2.5 1v2a1.5 1.5 0 0 1-1.65 1.5A10.5 10.5 0 0 1 2.75 3.9 1.5 1.5 0 0 1 4.25 2.25Z" />
    </Icon>
  );
}

/** Hidden identifiers, in the redaction notice. */
export function EyeOff(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6.1 3.4A6.6 6.6 0 0 1 8 3.1c3.3 0 5.6 2.6 6.4 4.9a9 9 0 0 1-2 3" />
      <path d="M4.2 4.7A9.4 9.4 0 0 0 1.6 8c.8 2.3 3.1 4.9 6.4 4.9a6.7 6.7 0 0 0 2.7-.55" />
      <path d="M6.6 6.6a2 2 0 0 0 2.8 2.8" />
      <path d="M2 2l12 12" />
    </Icon>
  );
}

/** An external link, so a link never relies on colour alone. */
export function ArrowUpRight(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M5 11 11 5" />
      <path d="M6.5 5H11v4.5" />
    </Icon>
  );
}
