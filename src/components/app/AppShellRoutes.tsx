import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '@legacy/pages/Home.jsx';
import Shield from '@legacy/pages/Shield.jsx';
import Checklist from '@legacy/pages/Checklist.jsx';
import Translate from '@legacy/pages/Translate.jsx';
import Chat from '@legacy/pages/Chat.jsx';
import Community from '@legacy/pages/Community.jsx';
import VoiceSOS from '@legacy/pages/VoiceSOS.jsx';
import TideBank from '@legacy/pages/TideBank.jsx';
import Profile from '@legacy/pages/Profile.jsx';
import People from '@legacy/pages/People.jsx';

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
const Dashboard = lazy(() => import('@legacy/pages/Dashboard.jsx'));
const RentalShield = lazy(() => import('@legacy/pages/RentalShield.jsx'));

function DashboardFallback(): JSX.Element {
  return (
    <section
      className="page dashboard-skeleton"
      aria-label="Loading dashboard"
    >
      <i />
      <i />
      <i />
      <b />
      <b />
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
      <Route path="home" element={<Home />} />
      <Route path="shield" element={<Shield />} />
      <Route path="checklist" element={<Checklist />} />
      <Route path="translate" element={<Translate />} />
      <Route path="chat" element={<Chat />} />
      <Route path="community" element={<Community />} />
      <Route path="voice-sos" element={<VoiceSOS />} />
      <Route path="tide-bank" element={<TideBank />} />
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
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
