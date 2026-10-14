import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { Bento, BentoItem, Cluster, Heading, Stack, Text } from '../layout';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { ActivityPanel } from './ActivityPanel';
import { CommunityPanel } from './CommunityPanel';
import { DashboardRail } from './DashboardRail';
import { DashboardScene } from './DashboardScene';
import { ImpactPanel } from './ImpactPanel';
import { MetricRow, type Metric } from './MetricRow';
import { NudgeCard } from './NudgeCard';
import { SafetyPanel } from './SafetyPanel';
import { TaskPanel } from './TaskPanel';
import { TideBankCard } from './TideBankCard';
import { ToolCards } from './ToolCards';
import {
  deriveTaskProgress,
  motionAllowed,
  readFriends,
  readHistory,
  readTidePoints,
} from './dashboard-data';

gsap.registerPlugin(ScrollTrigger);

/**
 * Dashboard — the `/app/dashboard` page (docs/DASHBOARD_DESIGN_SPEC.md).
 *
 * It renders **inside** the existing shell, which already supplies the top nav,
 * the mobile bottom tab bar, the theme toggle and the toast host. This page adds
 * only the left icon rail and the content grid, and it renders a `<section>` —
 * never a second `<main>`.
 *
 * Layout is two grid layers (§4.1): `.dash-grid` is the page (rail column +
 * content column), and `<Bento>` is the content (12 columns from 64em). Module
 * spans follow the table in §4.1 exactly.
 *
 * Motion (§6.1) is a single GSAP timeline, scoped to the page root and gated on
 * reduced motion and the shell's calm mode — under either, the final states
 * render with no timeline at all (§6.3).
 */
export function Dashboard(): JSX.Element {
  const root = useRef<HTMLElement>(null);
  const { profile } = useProfile();

  const history = useMemo(() => readHistory(), []);
  const friends = useMemo(() => readFriends(), []);
  const points = useMemo(() => readTidePoints(), []);
  const task = useMemo(() => deriveTaskProgress(), []);

  const metrics: Metric[] = [
    {
      label: 'Checklist steps',
      value: task.done,
      note: 'Completed on this device.',
    },
    {
      label: 'Tide points',
      value: points,
      note: 'Demo points — not money, and not a financial product.',
      demo: true,
    },
    {
      label: 'Friends',
      value: friends.length,
      note: 'People you have added.',
    },
  ];

  useLayoutEffect(() => {
    // §6.1 gate: reduced motion or calm mode → no timeline, final states only.
    if (!motionAllowed()) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline();

      // Beat 1 — the welcome header. --dur-slow (0.6s), power3.out.
      timeline.fromTo(
        '.dash-header',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' },
      );

      // Beat 2 — the metric cards. --dur-base (0.3s), stagger --dur-fast (0.15s).
      timeline.fromTo(
        '.dash-metric',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'all',
        },
        '-=0.3',
      );

      // Beat 3 — the panels.
      timeline.fromTo(
        '.dash-panel',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'all',
        },
        '-=0.15',
      );

      // Beat 4 — the lower panels, revealed once as they scroll into view.
      gsap.utils.toArray<HTMLElement>('.dash-lower').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            ease: 'power3.out',
            clearProps: 'all',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  const name = profile?.name?.trim() || 'friend';
  const avatarSrc = profile?.avatar || profile?.photo || undefined;

  return (
    <section ref={root} className="dash-page" aria-labelledby="dash-title">
      <DashboardScene />

      <div className="dash-grid">
        <DashboardRail />

        <Bento>
          <BentoItem size="full" className="dash-header">
            <Cluster justify="between" align="start" gap={6}>
              <Stack gap={3}>
                <Text role="label" tone="muted">
                  Your Harbour · Personal dashboard
                </Text>
                <Heading level={1} id="dash-title">
                  Welcome back, {name}.
                </Heading>
                <Text tone="muted">
                  A quiet overview of the small steps you have taken in Hong
                  Kong.
                </Text>
              </Stack>

              <Button variant="secondary" size="small" asChild>
                <Link to="/app/profile" aria-label="Edit my details">
                  <Avatar name={profile?.name ?? 'Harbour'} src={avatarSrc} size="sm" />
                  Edit my details
                </Link>
              </Button>
            </Cluster>
          </BentoItem>

          <MetricRow metrics={metrics} />

          <ActivityPanel history={history} />

          <TaskPanel
            done={task.done}
            total={task.total}
            progress={task.progress}
            nextTasks={task.nextTasks}
          />

          <ToolCards />

          <NudgeCard />
          <TideBankCard points={points} />
          <SafetyPanel />

          <CommunityPanel friends={friends} socials={profile?.socials ?? {}} />

          <ImpactPanel />
        </Bento>
      </div>
    </section>
  );
}
