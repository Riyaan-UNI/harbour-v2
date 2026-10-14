/**
 * The Scam Drill bank — pre-authored practice scenarios, ported verbatim.
 *
 * Source: the old build's `server/services/drillService.js` (lines 12–185).
 * Every message, option, safety flag and signal is unchanged: these scenarios
 * were written for this product and the port carries them over exactly. The
 * old build could ask a model to rephrase a turn's wording; the v2 port drops
 * that entirely — nothing here is generated, and every screen keeps the
 * SIMULATION banner.
 *
 * Scoring and the debrief strings are also verbatim (old lines 273–281). What
 * does not carry over is the server's session store and `randomUUID`: session
 * state is component-local, so a reload simply starts over.
 */

import type {
  DrillDebrief,
  DrillScenario,
  DrillScenarioId,
} from './types';

/** The four scenarios, in the order the old build listed them. */
export const SCENARIOS: Record<DrillScenarioId, DrillScenario> = {
  fake_official: {
    label: 'Someone claiming to be an official',
    brief:
      "A caller claims to be from a government department and says the student's visa record has a problem that can be fixed with a payment.",
    signals: ['Authority impersonation', 'Urgency', 'Payment demand'],
    turns: [
      {
        message:
          'This is the records section. Your student visa record shows an irregularity. Confirm your identity now or the case moves to the next stage today.',
        signal: 'Authority impersonation',
        options: [
          { id: 'a', label: 'Give your name and identity card number to speed it up', safe: false },
          { id: 'b', label: 'Hang up and call the department using the number on its official website', safe: true },
          { id: 'c', label: 'Ask them to email you and keep talking', safe: false },
        ],
      },
      {
        message:
          'We can hold the case for two hours, but you must settle a records fee of a few hundred dollars by transfer to this account ending 0000.',
        signal: 'Payment demand',
        options: [
          { id: 'a', label: 'Ask for the fee in writing with an official reference number', safe: true },
          { id: 'b', label: 'Transfer the fee because the amount is small', safe: false },
          { id: 'c', label: 'Send half now and half later', safe: false },
        ],
      },
      {
        message:
          'Do not tell your university. Third parties slow the process down and your case is confidential.',
        signal: 'Isolation',
        options: [
          { id: 'a', label: 'Agree to keep it secret', safe: false },
          { id: 'b', label: "Tell your university's international office straight away", safe: true },
          { id: 'c', label: 'Post about it in a group chat and wait', safe: false },
        ],
      },
      {
        message:
          'We need the one-time code we just sent to your phone to confirm the file. Read it to me now.',
        signal: 'Code harvesting',
        options: [
          { id: 'a', label: 'Read the code out', safe: false },
          { id: 'b', label: 'Never share a one-time code with anyone', safe: true },
          { id: 'c', label: 'Send a screenshot of the message instead', safe: false },
        ],
      },
    ],
  },
  fake_parcel: {
    label: "A parcel that is 'held'",
    brief:
      "A message says a parcel is held and a small redelivery fee unlocks it.",
    signals: ['Small-fee bait', 'Link pressure', 'Fake deadline'],
    turns: [
      {
        message:
          'Your parcel is held at the depot. Pay a small redelivery fee today or it returns to the sender. Open the link to claim it.',
        signal: 'Small-fee bait',
        options: [
          { id: 'a', label: 'Open the link and pay the small fee', safe: false },
          { id: 'b', label: "Check the tracking number on the courier's official website yourself", safe: true },
          { id: 'c', label: 'Reply asking for a bigger discount', safe: false },
        ],
      },
      {
        message:
          'The link did not work? Confirm your card number and the one-time code so we can process it manually.',
        signal: 'Card harvesting',
        options: [
          { id: 'a', label: 'Send the card number and code', safe: false },
          { id: 'b', label: 'Stop and contact your bank if you already entered card details', safe: true },
          { id: 'c', label: 'Send only the first six digits', safe: false },
        ],
      },
      {
        message:
          'This is your final notice. Your address will be blacklisted for future deliveries.',
        signal: 'Threat',
        options: [
          { id: 'a', label: 'Pay to avoid being blacklisted', safe: false },
          { id: 'b', label: 'Ignore the threat and report the message to 18222', safe: true },
          { id: 'c', label: 'Ask a friend to pay for you', safe: false },
        ],
      },
      {
        message:
          'Would you like us to call you back on the number you gave us earlier?',
        signal: 'Callback trap',
        options: [
          { id: 'a', label: 'Give your number', safe: false },
          { id: 'b', label: 'Never give details to an inbound caller; call the company yourself', safe: true },
          { id: 'c', label: "Give your university's number", safe: false },
        ],
      },
    ],
  },
  fake_landlord: {
    label: 'A flat that is too good',
    brief:
      "A flat is advertised below market rate and the 'landlord' wants a deposit before any viewing.",
    signals: ['Below-market bait', 'Deposit before viewing', 'No viewing'],
    turns: [
      {
        message:
          "The flat is below market because I am overseas. Send one month's deposit today and I will hold it for you. Viewing is not possible this week.",
        signal: 'Deposit before viewing',
        options: [
          { id: 'a', label: 'Send the deposit to hold the flat', safe: false },
          { id: 'b', label: 'Insist on a viewing and never pay before you see the flat', safe: true },
          { id: 'c', label: 'Send a smaller holding fee', safe: false },
        ],
      },
      {
        message:
          'Many students are asking. If you pay three months up front I will take it off the market immediately.',
        signal: 'Urgency and lump sum',
        options: [
          { id: 'a', label: 'Pay three months up front', safe: false },
          { id: 'b', label: 'Walk away; three months up front is a common scam pattern', safe: true },
          { id: 'c', label: 'Ask for a discount and pay two months', safe: false },
        ],
      },
      {
        message:
          'I can send the keys by courier once the transfer clears. I do not need to give you my licence number.',
        signal: 'Refusing identification',
        options: [
          { id: 'a', label: 'Accept it; the flat looks real', safe: false },
          { id: 'b', label: "Ask for the agent's licence number and check it on the EAA list", safe: true },
          { id: 'c', label: 'Ask for a photo of the keys', safe: false },
        ],
      },
      {
        message:
          'A friend of mine can collect the cash instead. Meet him at the station tonight.',
        signal: 'Cash handover',
        options: [
          { id: 'a', label: 'Meet and hand over the cash', safe: false },
          { id: 'b', label: 'Refuse any cash handover and use traceable payment only', safe: true },
          { id: 'c', label: 'Send half in cash and half by transfer', safe: false },
        ],
      },
    ],
  },
  fake_internship: {
    label: 'An internship with a fee',
    brief:
      "A 'recruiter' offers a placement but asks for a training fee and personal documents.",
    signals: ['Pay-to-work', 'Document harvesting', 'Fake urgency'],
    turns: [
      {
        message:
          'Congratulations, you are selected. Pay a training fee this week to secure your place and we will send the contract.',
        signal: 'Pay-to-work',
        options: [
          { id: 'a', label: 'Pay the training fee to secure the place', safe: false },
          { id: 'b', label: 'Refuse; a genuine employer never charges you to start', safe: true },
          { id: 'c', label: 'Negotiate a lower fee', safe: false },
        ],
      },
      {
        message:
          'Send a copy of your identity card, your bank statement and your student number so we can set up payroll.',
        signal: 'Document harvesting',
        options: [
          { id: 'a', label: 'Send everything at once', safe: false },
          { id: 'b', label: 'Ask for the company registration and a named contact first', safe: true },
          { id: 'c', label: 'Send only the identity card', safe: false },
        ],
      },
      {
        message:
          'The offer closes in one hour. Reply yes and we will keep your file open.',
        signal: 'Fake urgency',
        options: [
          { id: 'a', label: 'Reply yes immediately', safe: false },
          { id: 'b', label: 'Take your time; a real offer survives a day', safe: true },
          { id: 'c', label: 'Reply maybe and wait', safe: false },
        ],
      },
      {
        message:
          'If you do not pay the fee we will report the withdrawal to your university.',
        signal: 'Threat',
        options: [
          { id: 'a', label: 'Pay to avoid trouble', safe: false },
          { id: 'b', label: 'Keep the messages and report it to your careers office', safe: true },
          { id: 'c', label: 'Delete the messages', safe: false },
        ],
      },
    ],
  },
};

/** The scenario ids, in listing order — what the picker renders. */
export const SCENARIO_IDS: readonly DrillScenarioId[] = [
  'fake_official',
  'fake_parcel',
  'fake_landlord',
  'fake_internship',
];

/**
 * The picker's rows — id, label and one-line brief, in listing order.
 *
 * The old build's `drillScenarioList` returned exactly this shape; the id
 * comes from the map key, so nothing is stored twice.
 */
export function listScenarios(): {
  id: DrillScenarioId;
  label: string;
  brief: string;
}[] {
  return SCENARIO_IDS.map((id) => {
    const scenario = SCENARIOS[id];
    return { id, label: scenario.label, brief: scenario.brief };
  });
}

/**
 * Look a scenario up by id.
 *
 * The bank is a total map — every `DrillScenarioId` has an entry — so this
 * simply narrows the lookup for call sites and keeps the turns array the only
 * thing they need to guard when indexing.
 */
export function getScenario(id: DrillScenarioId): DrillScenario {
  return SCENARIOS[id];
}

/** The band a finished practice earns — old build's four bands, verbatim. */
export function scoreBand(score: number): string {
  if (score >= 90) return 'Harbour guard';
  if (score >= 70) return 'Steady hand';
  if (score >= 40) return 'Getting there';
  return 'Worth another run';
}

/**
 * The debrief strings — old build's wording, verbatim.
 *
 * `missed` is the list of signals the player fell for, in the order they
 * happened; an empty list changes the second line to a clean-run message.
 */
export function debriefFor(input: {
  safe: number;
  answered: number;
  missed: readonly string[];
}): string[] {
  const { safe, answered, missed } = input;
  return [
    `You handled ${safe} of ${answered} moments safely.`,
    missed.length
      ? `Watch for these again: ${missed.join(', ')}.`
      : 'You did not fall for any of the tactics in this scenario.',
    "In real life: never share a one-time code, never pay before you see the flat or the contract, and always verify with the organisation's own website.",
  ];
}

/** A finished practice's summary, ready to render. */
export function finishDebrief(input: {
  scenario: string;
  signals: readonly string[];
  safe: number;
  answered: number;
  caught: readonly string[];
  missed: readonly string[];
}): DrillDebrief {
  const answered = Math.max(input.answered, 1);
  const score = Math.round((input.safe / answered) * 100);
  return {
    score,
    band: scoreBand(score),
    caught: [...input.caught],
    missed: [...input.missed],
    scenario: input.scenario,
    debrief: debriefFor({
      safe: input.safe,
      answered,
      missed: input.missed,
    }),
    signals: [...input.signals],
  };
}
