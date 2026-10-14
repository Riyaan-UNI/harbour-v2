import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { Stack } from '../layout';
import {
  Bell,
  Bookmark,
  CheckCircle,
  Home,
  Languages,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from '../ui/icons';

/**
 * DashboardRail — module 8. The sticky left icon rail, the dashboard's own
 * chrome. It renders only from 64em (below that the shell's bottom tab bar and
 * More panel already reach every one of these destinations — §4.6), and it
 * never renders a second top bar: the shell owns `.harbour-topnav`.
 *
 * Each item is a real `NavLink` at the 2.75rem touch target. React Router sets
 * `aria-current="page"` on the active item itself, and the label is revealed on
 * hover **and** `:focus-visible` (never hover-only, spec §6).
 */

type RailItem = {
  label: string;
  path: string;
  Icon: ComponentType<{ className?: string }>;
};

const RAIL: RailItem[] = [
  { label: 'My Harbour', path: '/app/home', Icon: Home },
  { label: 'Dashboard', path: '/app/dashboard', Icon: Sparkles },
  { label: 'Scam X-ray', path: '/app/scam', Icon: ShieldAlert },
  { label: 'Settle-in list', path: '/app/checklist', Icon: CheckCircle },
  { label: 'Cantonese helper', path: '/app/translate', Icon: Languages },
  { label: 'Ask Harbour', path: '/app/chat', Icon: Send },
  { label: 'Rental Shield', path: '/app/rental', Icon: Bookmark },
  { label: 'Find people', path: '/app/people', Icon: User },
  { label: 'Community', path: '/app/community', Icon: Bell },
  { label: 'Tide Bank', path: '/app/tide-bank', Icon: RefreshCw },
];

export function DashboardRail(): JSX.Element {
  return (
    <nav className="dash-rail" aria-label="Dashboard destinations">
      <Stack gap={2} className="dash-rail__list">
        {RAIL.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className="dash-rail__link"
            aria-label={label}
          >
            <Icon className="size-5" />
            <span className="dash-rail__label" aria-hidden="true">
              {label}
            </span>
          </NavLink>
        ))}
      </Stack>
    </nav>
  );
}
