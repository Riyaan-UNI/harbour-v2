import {
  AlertTriangle as LucideAlertTriangle,
  ArrowLeftRight as LucideArrowLeftRight,
  ArrowRight as LucideArrowRight,
  ArrowUpRight as LucideArrowUpRight,
  Bell as LucideBell,
  Bookmark as LucideBookmark,
  Camera as LucideCamera,
  Check as LucideCheck,
  CheckCircle as LucideCheckCircle,
  ChevronDown as LucideChevronDown,
  Copy as LucideCopy,
  EyeOff as LucideEyeOff,
  GraduationCap as LucideGraduationCap,
  Home as LucideHome,
  Info as LucideInfo,
  Languages as LucideLanguages,
  LayoutDashboard as LucideLayoutDashboard,
  ListChecks as LucideListChecks,
  LoaderCircle,
  Globe as LucideGlobe,
  MessageSquare as LucideMessageSquare,
  Menu as LucideMenu,
  Mic as LucideMic,
  Pause as LucidePause,
  PenLine as LucidePenLine,
  Phone as LucidePhone,
  Play as LucidePlay,
  Plus as LucidePlus,
  Heart as LucideHeart,
  MapPin as LucideMapPin,
  MessageCircle as LucideMessageCircle,
  Search as LucideSearch,
  Share2 as LucideShare2,
  Star as LucideStar,
  RefreshCw as LucideRefreshCw,
  Send as LucideSend,
  ShieldAlert as LucideShieldAlert,
  Sparkles as LucideSparkles,
  Type as LucideType,
  Volume2 as LucideVolume2,
  User as LucideUser,
  Users as LucideUsers,
  Wallet as LucideWallet,
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

/** A plain check, for a selected row in a listbox or a confirmed choice. */
export const Check = createIcon(LucideCheck, 'Check');

/** The disclosure arrow on a select, combobox or expander trigger. */
export const ChevronDown = createIcon(LucideChevronDown, 'ChevronDown');

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

/** A bell, used for notifications and warnings. */
export const Bell = createIcon(LucideBell, 'Bell');

/** A bookmark, used for saved items. */
export const Bookmark = createIcon(LucideBookmark, 'Bookmark');

/** A camera, used for visual translate features. */
export const Camera = createIcon(LucideCamera, 'Camera');

/** A home, for the bottom nav landing page. */
export const Home = createIcon(LucideHome, 'Home');

/** A languages globe, for the translation feature. */
export const Languages = createIcon(LucideLanguages, 'Languages');

/** A microphone, for the voice translation feature. */
export const Mic = createIcon(LucideMic, 'Mic');

/** A pause, paired with a Play to toggle an audio source. */
export const Pause = createIcon(LucidePause, 'Pause');

/** A pen, used for text input variants. */
export const PenLine = createIcon(LucidePenLine, 'PenLine');

/** A play arrow, paired with a Pause to toggle an audio source. */
export const Play = createIcon(LucidePlay, 'Play');

/** A plus glyph, for compact add-create controls. */
export const Plus = createIcon(LucidePlus, 'Plus');

/** A paper airplane send, for messaging input submit. */
export const Send = createIcon(LucideSend, 'Send');

/** Four-point sparkles, for AI/enhance hints. */
export const Sparkles = createIcon(LucideSparkles, 'Sparkles');

/** A typography "T", for the text translate feature card. */
export const Type = createIcon(LucideType, 'Type');

/** A user, for the bottom nav profile tab. */
export const User = createIcon(LucideUser, 'User');

/** A left-to-right arrows pair, for swapping the source and target language. */
export const ArrowLeftRight = createIcon(LucideArrowLeftRight, 'ArrowLeftRight');

/** Two overlapping sheets, the copy affordance. */
export const Copy = createIcon(LucideCopy, 'Copy');

/** A speaker, to play a translated phrase aloud. */
export const Volume2 = createIcon(LucideVolume2, 'Volume2');

/** A group of users, for the people directory. */
export const Users = createIcon(LucideUsers, 'Users');

/** A checklist, for the settle-in steps. */
export const ListChecks = createIcon(LucideListChecks, 'ListChecks');

/** A message square, for the Ask Harbour chat. */
export const MessageSquare = createIcon(LucideMessageSquare, 'MessageSquare');

/** A dashboard, for the progress overview. */
export const LayoutDashboard = createIcon(
  LucideLayoutDashboard,
  'LayoutDashboard',
);

/** A globe, for the community overview. */
export const Globe = createIcon(LucideGlobe, 'Globe');

/** A wallet, for the Tide Bank demo balance. */
export const Wallet = createIcon(LucideWallet, 'Wallet');

/** A filled heart — the "like" state in the people directory. */
export const Heart = createIcon(LucideHeart, 'Heart');

/** A location pin, for where someone is settling in. */
export const MapPin = createIcon(LucideMapPin, 'MapPin');

/** A speech bubble — comments and replies. */
export const MessageCircle = createIcon(LucideMessageCircle, 'MessageCircle');

/** A magnifier — search fields. Always paired with a label or placeholder. */
export const Search = createIcon(LucideSearch, 'Search');

/** A share arrow — send a card to someone else. */
export const Share2 = createIcon(LucideShare2, 'Share2');

/** A star — featured or favourite. */
export const Star = createIcon(LucideStar, 'Star');
