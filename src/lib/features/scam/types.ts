/**
 * Shared types for the Scam Shield engines.
 *
 * The screen and the drill bank return these shapes so a future server route
 * could return exactly the same objects and no screen would need to change —
 * the same backend-agnostic contract the rest of the brick plan uses.
 */

/** The three risk bands the keyword screen can return. */
export type RiskLevel = 'Low' | 'Medium' | 'High';

/** A plain-language read of one message. */
export type ScanResult = {
  riskLevel: RiskLevel;
  /** One line naming what the patterns add up to. */
  issue: string;
  /** What this read is, and what it cannot tell you. */
  explanation: string;
  /** The patterns worth noticing, in plain words. */
  warningSigns: string[];
  /** Sensible next steps, starting with the safest. */
  actions: string[];
  /** Who to call for a second opinion. */
  support: { name: string; phone: string };
};

/** The four pre-authored practice scenarios. */
export type DrillScenarioId =
  | 'fake_official'
  | 'fake_parcel'
  | 'fake_landlord'
  | 'fake_internship';

/** One answer in a turn. Exactly one option per turn is `safe`. */
export type DrillOption = {
  id: string;
  label: string;
  safe: boolean;
};

/** One message in a scenario, with the signal it carries. */
export type DrillTurn = {
  message: string;
  signal: string;
  options: DrillOption[];
};

/**
 * A whole practice scenario: pre-authored, never generated.
 *
 * The scenario's id is its key in `SCENARIOS`, exactly as the old build's bank
 * was shaped — so no entry repeats its own id.
 */
export type DrillScenario = {
  label: string;
  brief: string;
  /** The signals this scenario practises, shown in the debrief. */
  signals: string[];
  turns: DrillTurn[];
};

/** What the practice session says right after an answer. */
export type DrillFeedback = {
  safe: boolean;
  signal: string;
  note: string;
};

/** The end-of-practice summary. */
export type DrillDebrief = {
  score: number;
  band: string;
  caught: string[];
  missed: string[];
  scenario: string;
  debrief: string[];
  signals: string[];
};
