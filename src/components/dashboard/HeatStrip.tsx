import { buildHeat } from './dashboard-data';

/**
 * HeatStrip — module 3's honest stand-in for the reference's dotted world map
 * (spec §1). A real 28-day activity grid built from `harbour-progress-history`.
 *
 * No per-cell animation (spec §6.2): the strip appears with its panel's opacity
 * reveal. The grid is a single `role="img"` with a text alternative, so the
 * pattern is never carried by colour alone; the legend is decorative.
 */

export type HeatStripProps = {
  history: Record<string, number>;
};

export function HeatStrip({ history }: HeatStripProps): JSX.Element {
  const cells = buildHeat(history);
  const total = cells.reduce((sum, cell) => sum + cell.value, 0);
  const activeDays = cells.filter((cell) => cell.level > 0).length;

  return (
    <div className="dash-heat">
      <div
        className="dash-heat__grid"
        role="img"
        aria-label={`Activity over the last 28 days: ${total} step${total === 1 ? '' : 's'} across ${activeDays} active day${activeDays === 1 ? '' : 's'}.`}
      >
        {cells.map((cell) => (
          <span key={cell.key} className="dash-heat-cell" data-level={cell.level} />
        ))}
      </div>

      <div className="dash-heat__legend" aria-hidden="true">
        <span>Less</span>
        <span className="dash-heat-cell" data-level="0" />
        <span className="dash-heat-cell" data-level="1" />
        <span className="dash-heat-cell" data-level="2" />
        <span className="dash-heat-cell" data-level="3" />
        <span>More</span>
      </div>
    </div>
  );
}
