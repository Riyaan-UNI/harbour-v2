import type { CSSProperties } from 'react';
import type { RiskLevel } from '../../../lib/features/scam/types';

/**
 * RiskMeter — five dots, filled by risk level.
 *
 * The dots are decoration: `aria-hidden`, because Addendum 1 rule 4 says risk
 * is never colour alone. The visible label beside the meter carries the words
 * ("Medium risk"), and the risk badge nearby adds the icon — so neither the
 * colour nor the shape is ever the only carrier of meaning.
 *
 * Fill per level, Low → Medium → High: 1, 3, 5 dots.
 */

const FILLED: Record<RiskLevel, number> = {
  Low: 1,
  Medium: 3,
  High: 5,
};

/** Each level dots to the semantic token for its risk band. */
const DOT_TOKEN: Record<RiskLevel, string> = {
  Low: 'var(--success)',
  Medium: 'var(--gold-text)',
  High: 'var(--danger)',
};

const DOTS = [0, 1, 2, 3, 4] as const;

export type RiskMeterProps = {
  level: RiskLevel;
  /** How many indicator groups matched — the honesty line under the dots. */
  matched: number;
  className?: string;
};

export function RiskMeter({
  level,
  matched,
  className,
}: RiskMeterProps): JSX.Element {
  const filled = FILLED[level];

  return (
    <div className={className}>
      <div
        className="scam-meter flex items-center gap-2"
        style={{ '--meter-fill': DOT_TOKEN[level] } as CSSProperties}
        aria-hidden="true"
      >
        {DOTS.map((index) => (
          <span
            key={index}
            className="scam-meter__dot rounded-pill"
            data-filled={index < filled ? 'true' : 'false'}
          />
        ))}
      </div>
      <p className="type-small text-text-muted">
        {level} risk — {matched} of 4 patterns matched
      </p>
    </div>
  );
}
