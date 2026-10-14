/**
 * The Scam X-ray keyword screen — the deterministic engine behind the tool.
 *
 * Ported from the old build's server fallback (`server/routes/scam.js`, lines
 * 14–25): the same four indicator groups, the same High/Medium/Low rule, the
 * same result copy. The old build reached a model first and fell back to this
 * screen when the model failed; the v2 port ships the deterministic screen
 * only (the hybrid decision keeps live AI for Ask Harbour, later), so every
 * result is honestly labelled a basic keyword check.
 *
 * One deviation from the ported strings, for honesty: the old explanation
 * opened with "Automated AI review is unavailable, so…", which implies an AI
 * service exists behind the tool. There is none here, so the sentence now
 * states only what is true. Everything else is verbatim.
 */

import type { RiskLevel, ScanResult } from './types';

/** The four indicator groups, counted the old build's way. */
const INDICATORS: readonly RegExp[] = [
  /urgent|immediately|today/i,
  /password|one.time.code|otp/i,
  /bank|payment|transfer|fee/i,
  /click|link|verify/i,
];

/** The helpline every read points to — the standing UNVERIFIED flag applies. */
export const SUPPORT_CONTACT = {
  name: 'Hong Kong Police Anti-Scam Helpline',
  phone: '18222',
} as const;

/**
 * Run the basic keyword screen over one message.
 *
 * High needs two or more indicator groups, Medium one, Low none. The result
 * never says whether a message is genuine — it names the patterns it saw and
 * stops there.
 */
export function screenScam(text: string): ScanResult {
  const matches = INDICATORS.filter((pattern) => pattern.test(text)).length;
  const riskLevel: RiskLevel =
    matches >= 2 ? 'High' : matches === 1 ? 'Medium' : 'Low';

  return {
    riskLevel,
    issue: matches
      ? 'Potential social engineering'
      : 'No obvious scam pattern found',
    explanation:
      'This is a basic keyword screen only. It cannot confirm whether a message is genuine.',
    warningSigns: matches
      ? [
          'The message contains language commonly used to pressure people or request sensitive information.',
        ]
      : [
          'A basic scan found no common warning words; this does not prove the message is safe.',
        ],
    actions: [
      'Do not share passwords or one-time codes.',
      'Contact the organisation using a phone number from its official website.',
    ],
    support: { ...SUPPORT_CONTACT },
  };
}
