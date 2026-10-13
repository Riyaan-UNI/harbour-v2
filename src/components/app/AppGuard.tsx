import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { AppShell } from './AppShell';
import { CalmModeProvider, ShellThemeProvider } from './ShellTheme';

/**
 * The route guard for `/app/*` — spec §12, and the master prompt's P1 line
 * "`/app/*` without a profile goes to `/login`".
 *
 * It reads the same context the ported pages read, so "signed in" means
 * exactly what it means to them: a `harbour-profile` the legacy reader could
 * normalise. There is no second notion of a session.
 *
 * The redirect carries the attempted path in `state.from`, so login can send
 * the user where they were actually going rather than always to `/app/home`.
 */
export function AppGuard({ children }: { children: React.ReactNode }): JSX.Element {
  const { profile } = useProfile();
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <ShellThemeProvider>
      <CalmModeProvider>{children}</CalmModeProvider>
    </ShellThemeProvider>
  );
}

/** The guarded app lane, with the shell inside the guard. */
export function GuardedApp(): JSX.Element {
  return (
    <AppGuard>
      <AppShell />
    </AppGuard>
  );
}
