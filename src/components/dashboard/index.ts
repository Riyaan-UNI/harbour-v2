/**
 * Dashboard — the `/app/dashboard` lane (docs/DASHBOARD_DESIGN_SPEC.md).
 *
 * Component re-exports only. The data readers and derivations live in
 * `dashboard-data.ts`, and non-component exports never sit beside a component
 * (the ESLint react-refresh rule).
 */
export { Dashboard } from './Dashboard';
export { DashboardRail } from './DashboardRail';
export { ActivityPanel } from './ActivityPanel';
export { HeatStrip } from './HeatStrip';
export { MetricRow } from './MetricRow';
export { TaskPanel } from './TaskPanel';
export { ToolCards } from './ToolCards';
export { CommunityPanel } from './CommunityPanel';
export { SafetyPanel } from './SafetyPanel';
export { TideBankCard } from './TideBankCard';
export { ImpactPanel } from './ImpactPanel';
export { NudgeCard } from './NudgeCard';
export { CountUp } from './count-up';
