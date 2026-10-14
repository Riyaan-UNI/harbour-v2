import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { BentoItem, Cluster, Cq, Heading, Stack, Text } from '../layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { CheckCircle } from '../ui/icons';
import { HeatStrip } from './HeatStrip';
import { buildSeries, summarise, type RangeKey } from './dashboard-data';

/**
 * ActivityPanel — module 3. The one glass surface on the page (`variant="static"`,
 * §5). A segmented range control drives a real Recharts series from
 * `harbour-progress-history` (1 / 7 / 30 bars), a 28-day heat strip sits beside
 * it, and a visible summary paragraph carries the chart's meaning for assistive
 * tech — the chart is never the only carrier (Addendum 1 rule 4).
 *
 * Recharts runs with `isAnimationActive={false}`: its default tween animates bar
 * height, a layout dimension the spec forbids (§6.2). The chart is simply drawn
 * inside the panel that reveals, so there is no fake progress.
 */

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export type ActivityPanelProps = {
  history: Record<string, number>;
};

export function ActivityPanel({ history }: ActivityPanelProps): JSX.Element {
  const [range, setRange] = useState<RangeKey>('week');

  const series = useMemo(() => buildSeries(history, range), [history, range]);
  const summary = useMemo(() => summarise(series, range), [series, range]);
  const total = series.reduce((sum, point) => sum + point.value, 0);
  const rangeLabel = RANGES.find((entry) => entry.key === range)?.label ?? '';

  return (
    <BentoItem size="twothirds" className="dash-panel">
      <Card variant="static">
        <CardHeader>
          <Cluster justify="between" align="start" gap={4}>
            <Stack gap={1}>
              <Text role="label" tone="muted">
                Your activity
              </Text>
              <Heading level={2}>Every step counts.</Heading>
            </Stack>
            <Cluster gap={2} role="group" aria-label="Activity range">
              {RANGES.map((entry) => (
                <Button
                  key={entry.key}
                  size="small"
                  variant={entry.key === range ? 'primary' : 'secondary'}
                  aria-pressed={entry.key === range}
                  onClick={() => setRange(entry.key)}
                >
                  {entry.label}
                </Button>
              ))}
            </Cluster>
          </Cluster>
        </CardHeader>

        <CardContent>
          <Cq>
            {total === 0 ? (
              <EmptyState
                title="No steps yet"
                icon={<CheckCircle className="text-accent-text size-8" />}
                action={
                  <Button size="small" asChild>
                    <Link to="/app/checklist">Open my settle-in list</Link>
                  </Button>
                }
              >
                Tick one item off your settle-in list and it will show up here.
              </EmptyState>
            ) : (
              <div
                className="dash-chart-box"
                role="img"
                aria-label={`Bar chart of checklist steps completed, ${rangeLabel.toLowerCase()}.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={series}
                    margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border)"
                      strokeDasharray="4 5"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-subtle)' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--glass-fill-strong)' }}
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: 'var(--hairline) solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text)',
                      }}
                      labelStyle={{ color: 'var(--text-muted)' }}
                      itemStyle={{ color: 'var(--text)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--chart-1)"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={34}
                      isAnimationActive={false}
                      name="Completed steps"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <Text role="small" tone="muted">
              {summary}
            </Text>

            <HeatStrip history={history} />

            <Text role="small" tone="subtle">
              Activity is stored locally in this browser.
            </Text>
          </Cq>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
