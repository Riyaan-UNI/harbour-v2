import { BentoItem, Cluster, Text } from '../layout';
import { Card, CardContent, CardHeader } from '../ui/card';
import { DemoBadge } from '../ui/demo-badge';
import { CountUp } from './count-up';

/**
 * MetricRow — module 2. Three count-up KPI cards, each a flat card (never
 * glass; a KPI is not a surface text has to fight for, §5). The figure reuses
 * the `type-h2` utility on a `<p>` rather than a bespoke size (§4.2).
 *
 * Only the tide figure is a demo value, so only it carries a DemoBadge; the
 * checklist and friends counts are real (Appendix B).
 */

export type Metric = {
  label: string;
  value: number;
  note: string;
  /** True only for the demo tide balance. */
  demo?: boolean;
};

export type MetricRowProps = {
  metrics: Metric[];
};

export function MetricRow({ metrics }: MetricRowProps): JSX.Element {
  return (
    <>
      {metrics.map((metric) => (
        <BentoItem key={metric.label} size="third" className="dash-metric">
          <Card variant="flat">
            <CardHeader>
              <Cluster justify="between" align="center" gap={2}>
                <Text role="label" tone="muted">
                  {metric.label}
                </Text>
                {metric.demo ? <DemoBadge variant="demo" /> : null}
              </Cluster>
            </CardHeader>
            <CardContent>
              <p className="type-h2 dash-metric__figure">
                <CountUp value={metric.value} />
              </p>
              <Text role="small" tone="muted">
                {metric.note}
              </Text>
            </CardContent>
          </Card>
        </BentoItem>
      ))}
    </>
  );
}
