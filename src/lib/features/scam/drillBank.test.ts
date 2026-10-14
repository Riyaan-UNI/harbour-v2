import { describe, expect, it } from 'vitest';
import {
  SCENARIOS,
  SCENARIO_IDS,
  debriefFor,
  finishDebrief,
  getScenario,
  scoreBand,
} from './drillBank';

describe('the scenario bank', () => {
  it('lists all four scenarios in the old build order', () => {
    expect(SCENARIO_IDS).toEqual([
      'fake_official',
      'fake_parcel',
      'fake_landlord',
      'fake_internship',
    ]);
  });

  it('gives every scenario four turns and exactly one safe option per turn', () => {
    for (const id of SCENARIO_IDS) {
      const scenario = SCENARIOS[id];
      expect(scenario.turns).toHaveLength(4);
      for (const turn of scenario.turns) {
        expect(turn.options.map((option) => option.id)).toEqual(['a', 'b', 'c']);
        expect(turn.options.filter((option) => option.safe)).toHaveLength(1);
      }
    }
  });

  it('carries the ported strings verbatim', () => {
    const parcel = getScenario('fake_parcel');
    expect(parcel.label).toBe("A parcel that is 'held'");
    expect(parcel.turns[0]?.message).toBe(
      'Your parcel is held at the depot. Pay a small redelivery fee today or it returns to the sender. Open the link to claim it.',
    );
    expect(parcel.turns[2]?.options.find((option) => option.safe)?.label).toBe(
      'Ignore the threat and report the message to 18222',
    );
    expect(parcel.signals).toEqual([
      'Small-fee bait',
      'Link pressure',
      'Fake deadline',
    ]);
  });
});

describe('scoreBand', () => {
  it('uses the four bands and their boundaries', () => {
    expect(scoreBand(100)).toBe('Harbour guard');
    expect(scoreBand(90)).toBe('Harbour guard');
    expect(scoreBand(89)).toBe('Steady hand');
    expect(scoreBand(70)).toBe('Steady hand');
    expect(scoreBand(69)).toBe('Getting there');
    expect(scoreBand(40)).toBe('Getting there');
    expect(scoreBand(39)).toBe('Worth another run');
    expect(scoreBand(0)).toBe('Worth another run');
  });
});

describe('debriefFor', () => {
  it('names the missed signals on a mixed run', () => {
    const lines = debriefFor({
      safe: 2,
      answered: 4,
      missed: ['Threat', 'Code harvesting'],
    });
    expect(lines[0]).toBe('You handled 2 of 4 moments safely.');
    expect(lines[1]).toBe('Watch for these again: Threat, Code harvesting.');
    expect(lines[2]).toBe(
      "In real life: never share a one-time code, never pay before you see the flat or the contract, and always verify with the organisation's own website.",
    );
  });

  it('switches the second line on a clean run', () => {
    const lines = debriefFor({ safe: 4, answered: 4, missed: [] });
    expect(lines[1]).toBe('You did not fall for any of the tactics in this scenario.');
  });
});

describe('finishDebrief', () => {
  it('scores a clean run at 100 with the top band', () => {
    const debrief = finishDebrief({
      scenario: getScenario('fake_parcel').label,
      signals: getScenario('fake_parcel').signals,
      safe: 4,
      answered: 4,
      caught: ['Small-fee bait', 'Card harvesting', 'Threat', 'Callback trap'],
      missed: [],
    });
    expect(debrief.score).toBe(100);
    expect(debrief.band).toBe('Harbour guard');
    expect(debrief.caught).toHaveLength(4);
    expect(debrief.missed).toEqual([]);
  });

  it('scores a half-safe run into the middle band', () => {
    const debrief = finishDebrief({
      scenario: 'Someone claiming to be an official',
      signals: ['Authority impersonation', 'Urgency', 'Payment demand'],
      safe: 2,
      answered: 4,
      caught: ['Authority impersonation', 'Payment demand'],
      missed: ['Isolation', 'Code harvesting'],
    });
    expect(debrief.score).toBe(50);
    expect(debrief.band).toBe('Getting there');
    expect(debrief.debrief[1]).toContain('Isolation');
  });

  it('never divides by zero', () => {
    const debrief = finishDebrief({
      scenario: 'A flat that is too good',
      signals: [],
      safe: 0,
      answered: 0,
      caught: [],
      missed: [],
    });
    expect(debrief.score).toBe(0);
    expect(debrief.band).toBe('Worth another run');
    expect(debrief.debrief[0]).toBe('You handled 0 of 1 moments safely.');
  });
});
