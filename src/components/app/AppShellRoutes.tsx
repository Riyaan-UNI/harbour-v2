import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Grid, Stack } from '../layout';
import { Skeleton } from '../ui/skeleton';
import { AppHome } from '../../routes/AppHome';
import { People } from '../../routes/People';
import { Profile } from '../../routes/Profile';
import Chat from '../../routes/app/Chat';
import Checklist from '@legacy/pages/Checklist.jsx';
import Translate from '../../routes/Translate';
import Community from '@legacy/pages/Community.jsx';
import VoiceSOS from '@legacy/pages/VoiceSOS.jsx';
import TideBank from '@legacy/pages/TideBank.jsx';
import { WelcomePlaceholder } from './WelcomePlaceholder';

/**
 * Every `/app/*` route, ported from the old build's `Shell` route table.
 *
 * Two of the ported pages (`Dashboard`, `RentalShield`) were lazy in the old
 * build because they are the two heaviest — Dashboard carries recharts and
 * RentalShield carries the rule engines. They stay lazy here, with the same
 * section-shaped skeleton the old build used, so the bundle profile is
 * unchanged.
 *
 * The legacy `/bunny-garden` route was dropped by the owner's decision (it is
 * a decorative breather with no product role), so nothing renders it.
 *
 * The `NotFound` catch-all sends an unknown `/app/...` to the app home rather
 * than to the landing page: a signed-in user who mistypes a sub-route should
 * land back in the app, not be ejected to the marketing site.
 */
const Dashboard = lazy(() =>
  import('../dashboard/Dashboard').then((module) => ({
    default: module.Dashboard,
  })),
);
const RentalShield = lazy(() => import('@legacy/pages/RentalShield.jsx'));

/**
 * The v2 Scam Shield page. Lazy, like the two heavy pages above: it is the
 * first rebuilt tool page and carries the Tabs component, the drill bank and
 * the keyword screen, none of which the landing chunk needs.
 */
const ScamShield = lazy(() => import('../../routes/app/ScamShield'));

/** The Scam Shield fallback, labelled for itself rather than borrowed. */
function ScamShieldFallback(): JSX.Element {
  return (
    <section className="dash-page" aria-label="Loading Scam Shield" aria-busy="true">
      <Stack gap={6} className="dash-fallback">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </Stack>
    </section>
  );
}

/**
 * The v2 dashboard's lazy fallback. A `Skeleton` composition inside the page's
 * own container (`.dash-fallback`), so the fallback and the loaded page share
 * the same width and do not jump between each other. The legacy
 * `dashboard-skeleton` class is left on disk and is still used by the Rental
 * Shield fallback below.
 */
function DashboardFallback(): JSX.Element {
  return (
    <section className="dash-page" aria-label="Loading dashboard" aria-busy="true">
      <Stack gap={6} className="dash-fallback">
        <Skeleton className="h-12 w-2/3" />
        <Grid min="md" gap={6}>
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </Grid>
        <Skeleton className="h-64" />
      </Stack>
    </section>
  );
}

function RentalFallback(): JSX.Element {
  return (
    <section
      className="page dashboard-skeleton"
      aria-label="Loading Rental Shield"
    >
      <i />
      <i />
      <b />
    </section>
  );
}

export function AppShellRoutes(): JSX.Element {
  /**
   * These paths are **relative to the `/app/*` route** that renders this
   * component. A nested `<Routes>` resolves its children against the parent
   * match, so a child at `"home"` matches `/app/home`. Writing `"/app/home"`
   * here would never match, and because an unmatched child renders nothing at
   * all, the failure is a silently empty `<main>` rather than an error.
   *
   * The `index` route covers `/app` itself, which the shell's own brand link
   * and any `/app` link reach.
   */
  return (
    <Routes>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="coming-soon" element={<WelcomePlaceholder />} />
      <Route path="home" element={<AppHome />} />
      {/* The Scam Shield. `/app/scam` is the tool's one address: the old
          build's `/shield` page was the ported original, and the v2 rebuild
          replaces it rather than sitting beside it. */}
      <Route
        path="scam"
        element={
          <Suspense fallback={<ScamShieldFallback />}>
            <ScamShield />
          </Suspense>
        }
      />
      <Route path="checklist" element={<Checklist />} />
      <Route path="translate" element={<Translate />} />
      <Route path="chat" element={<Chat />} />
      <Route path="community" element={<Community />} />
      <Route path="voice-sos" element={<VoiceSOS />} />
      <Route path="tide-bank" element={<TideBank />} />
      {/* The rebuilt profile. `profile` is the own-profile page (with the
          preview toggle); `profile/:userId` renders the same page's public
          view for a sample person, so the directory's card links keep working.
          Paths are unchanged — People.tsx deep-links to `/app/profile/<id>`. */}
      <Route path="profile" element={<Profile />} />
      <Route path="profile/:userId" element={<Profile />} />
      <Route path="people" element={<People />} />
      <Route
        path="dashboard"
        element={
          <Suspense fallback={<DashboardFallback />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="rental"
        element={
          <Suspense fallback={<RentalFallback />}>
            <RentalShield />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  );
}
