import { useCallback, useState } from 'react';
import {
  finishDebrief,
  getScenario,
} from '../../../lib/features/scam/drillBank';
import type {
  DrillDebrief,
  DrillFeedback,
  DrillScenarioId,
} from '../../../lib/features/scam/types';

/**
 * useDrillSession — the Scam Drill's state machine.
 *
 * A port of the old build's `useScamDrill` with every network call removed:
 * the scenarios are local, so there is no loading and no error status — the
 * only states a local practice session can be in are idle, playing, answered
 * (the last turn is in, waiting for the debrief) and done. The four-state
 * rule (Addendum 1 rule 1) is satisfied by the X-ray, which is the data
 * screen; a drill has no data to fail to load.
 *
 * The feedback note is the old build's wording, verbatim. Nothing persists:
 * a reload mid-drill drops back to idle, which the e2e spec pins.
 */

export type DrillStatus = 'idle' | 'playing' | 'answered' | 'done';

const IDLE = {
  status: 'idle' as DrillStatus,
  scamType: null as DrillScenarioId | null,
  turnIndex: 0,
  safeCount: 0,
  caught: [] as string[],
  missed: [] as string[],
  feedback: null as DrillFeedback | null,
  debrief: null as DrillDebrief | null,
};

export function useDrillSession() {
  const [status, setStatus] = useState<DrillStatus>(IDLE.status);
  const [scamType, setScamType] = useState<DrillScenarioId | null>(
    IDLE.scamType,
  );
  const [turnIndex, setTurnIndex] = useState(IDLE.turnIndex);
  const [safeCount, setSafeCount] = useState(IDLE.safeCount);
  const [caught, setCaught] = useState<string[]>(IDLE.caught);
  const [missed, setMissed] = useState<string[]>(IDLE.missed);
  const [feedback, setFeedback] = useState<DrillFeedback | null>(
    IDLE.feedback,
  );
  const [debrief, setDebrief] = useState<DrillDebrief | null>(IDLE.debrief);

  const begin = useCallback((id: DrillScenarioId): void => {
    setStatus('playing');
    setScamType(id);
    setTurnIndex(0);
    setSafeCount(0);
    setCaught([]);
    setMissed([]);
    setFeedback(null);
    setDebrief(null);
  }, []);

  const answer = useCallback(
    (optionId: string): void => {
      if (!scamType || status !== 'playing') return;
      const scenario = getScenario(scamType);
      const turn = scenario.turns[turnIndex];
      if (!turn) return;
      const chosen = turn.options.find((option) => option.id === optionId);
      if (!chosen) return;

      const nextIndex = turnIndex + 1;
      setFeedback({
        safe: chosen.safe,
        signal: turn.signal,
        note: chosen.safe
          ? `Good call. You spotted: ${turn.signal}.`
          : `That one plays into the scam. The signal was: ${turn.signal}.`,
      });
      setSafeCount(chosen.safe ? safeCount + 1 : safeCount);
      setCaught(
        chosen.safe ? [...new Set([...caught, turn.signal])] : caught,
      );
      setMissed(chosen.safe ? missed : [...new Set([...missed, turn.signal])]);
      setTurnIndex(nextIndex);
      setStatus(nextIndex >= scenario.turns.length ? 'answered' : 'playing');
    },
    [scamType, status, turnIndex, safeCount, caught, missed],
  );

  const finish = useCallback((): void => {
    if (!scamType || status !== 'answered') return;
    const scenario = getScenario(scamType);
    setDebrief(
      finishDebrief({
        scenario: scenario.label,
        signals: scenario.signals,
        safe: safeCount,
        answered: Math.max(turnIndex, 1),
        caught,
        missed,
      }),
    );
    setStatus('done');
  }, [scamType, status, safeCount, turnIndex, caught, missed]);

  const reset = useCallback((): void => {
    setStatus(IDLE.status);
    setScamType(IDLE.scamType);
    setTurnIndex(IDLE.turnIndex);
    setSafeCount(IDLE.safeCount);
    setCaught(IDLE.caught);
    setMissed(IDLE.missed);
    setFeedback(IDLE.feedback);
    setDebrief(IDLE.debrief);
  }, []);

  return {
    status,
    scamType,
    turnIndex,
    safeCount,
    caught,
    missed,
    feedback,
    debrief,
    begin,
    answer,
    finish,
    reset,
  };
}
