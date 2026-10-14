import { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Login from '@legacy/pages/Login.jsx';
import Onboarding from '@legacy/pages/Onboarding.jsx';
import ArrivalStory from './ArrivalStory';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { CalmModeProvider, ShellThemeProvider } from '../components/app/ShellTheme';
import {
  BlobBackground,
  GrainOverlay,
} from '../components/app/legacy-chrome';

/**
 * The v2 login and signup routes.
 *
 * The entry lane renders the local-profile picker, three-step signup, and
 * skippable arrival story inside the shared theme-aware entry shell.
 *
 * Why the legacy entry shell comes with them: `Login.jsx` and `Onboarding.jsx`
 * were written against `.app-shell.entry-shell` — the full-viewport entry
 * layout with the blob background and the grain, whose first child is the
 * visual column. Rendering them without it produces an unstyled column. The
 * shell is three lines; it is not product UI.
 *
 * `/login` remains available when a profile is active so users can choose a
 * saved local profile or remove one from this browser.
 */
function EntryShell({ children }: { children: React.ReactNode }): JSX.Element {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = gsap.utils.toArray<HTMLElement>(
      '.login-visual, .login-panel, .onboarding-entry .entry-top, .onboarding-entry .form-card, .onboarding-entry .entry-disclaimer',
      root.current,
    );
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all',
      },
    );
  }, { scope: root });

  return (
    <ShellThemeProvider>
      <CalmModeProvider>
        <div ref={root} className="app-shell entry-shell">
          <BlobBackground />
          <GrainOverlay />
          <main className="entry-area">{children}</main>
        </div>
      </CalmModeProvider>
    </ShellThemeProvider>
  );
}

export function LoginRoute(): JSX.Element {
  return (
    <EntryShell>
      <Login />
    </EntryShell>
  );
}

export function ArrivalStoryRoute(): JSX.Element {
  const { profile } = useProfile();
  const location = useLocation();
  if (!profile) return <Navigate to="/signup" replace />;
  const storageWarning = (location.state as { storageWarning?: string } | null)?.storageWarning || '';
  return (
    <EntryShell>
      <ArrivalStory storageWarning={storageWarning} />
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
