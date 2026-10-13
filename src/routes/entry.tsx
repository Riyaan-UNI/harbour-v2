import { Navigate, useLocation } from 'react-router-dom';
import Login from '@legacy/pages/Login.jsx';
import Onboarding from '@legacy/pages/Onboarding.jsx';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { CalmModeProvider, ShellThemeProvider } from '../components/app/ShellTheme';
import {
  BlobBackground,
  GrainOverlay,
} from '../components/app/legacy-chrome';

/**
 * The v2 login and signup routes.
 *
 * **P1 scope:** they render the ported legacy `Login.jsx` and `Onboarding.jsx`
 * inside the legacy entry shell, which is what makes the whole flow work today.
 * P2 replaces the bodies with the real v2 signup (nickname / country /
 * university / avatar) and login picker; the route names, the entry shell and
 * the redirect targets below are already the final ones, so P2 swaps a child
 * rather than a route.
 *
 * Why the legacy entry shell comes with them: `Login.jsx` and `Onboarding.jsx`
 * were written against `.app-shell.entry-shell` — the full-viewport entry
 * layout with the blob background and the grain, whose first child is the
 * visual column. Rendering them without it produces an unstyled column. The
 * shell is three lines; it is not product UI.
 *
 * The redirect when a profile already exists: the master prompt's flow is
 * "log out, log in again, and reach `/app/home`", so a signed-in user who opens
 * `/login` goes straight through rather than being shown the picker. Login's
 * own "Create another local profile" link is what offers a second profile.
 */
function EntryShell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ShellThemeProvider>
      <CalmModeProvider>
        <div className="app-shell entry-shell">
          <BlobBackground />
          <GrainOverlay />
          <main className="entry-area">{children}</main>
        </div>
      </CalmModeProvider>
    </ShellThemeProvider>
  );
}

export function LoginRoute(): JSX.Element {
  const { profile } = useProfile();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  // Already signed in: honour the guard's `from`, or go to the app home.
  if (profile) return <Navigate to={from ?? '/app/home'} replace />;

  return (
    <EntryShell>
      <Login />
    </EntryShell>
  );
}

export function SignupRoute(): JSX.Element {
  return (
    <EntryShell>
      <Onboarding />
    </EntryShell>
  );
}
