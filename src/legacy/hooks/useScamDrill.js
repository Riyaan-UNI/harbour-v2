import { useCallback, useState } from "react";
import { drillTurn, finishDrill, startDrill } from "../lib/featureApi.js";

export const DRILL_SCENARIOS = [
  { id: "fake_official", label: "Someone claiming to be an official" },
  { id: "fake_parcel", label: "A parcel that is 'held'" },
  { id: "fake_landlord", label: "A flat that is too good" },
  { id: "fake_internship", label: "An internship with a fee" },
];

const idle = { status: "idle", session: null, turn: null, feedback: null, error: null, debrief: null };

/** Hook for the Scam Drill practice mode inside Shield. */
export function useScamDrill() {
  const [state, setState] = useState(idle);

  const begin = useCallback(async scamType => {
    setState({ ...idle, status: "loading" });
    try {
      const session = await startDrill(scamType);
      setState({ status: "playing", session, turn: session.turn, feedback: null, error: null, debrief: null });
      return session;
    } catch (error) {
      setState({ ...idle, status: "error", error });
      return null;
    }
  }, []);

  const answer = useCallback(async optionId => {
    if (!state.session) return null;
    const previousTurn = state.turn;
    setState(current => ({ ...current, status: "loading" }));
    try {
      const payload = await drillTurn(state.session.sessionId, optionId);
      setState(current => ({
        ...current,
        status: payload.done ? "answered" : "playing",
        turn: payload.turn || previousTurn,
        feedback: payload.feedback,
        error: null,
        finished: payload.done,
      }));
      return payload;
    } catch (error) {
      setState(current => ({ ...current, status: "playing", error }));
      return null;
    }
  }, [state.session, state.turn]);

  const finish = useCallback(async () => {
    if (!state.session) return null;
    setState(current => ({ ...current, status: "loading" }));
    try {
      const debrief = await finishDrill(state.session.sessionId);
      setState(current => ({ ...current, status: "done", debrief, error: null }));
      return debrief;
    } catch (error) {
      setState(current => ({ ...current, status: "answered", error }));
      return null;
    }
  }, [state.session]);

  const reset = useCallback(() => setState(idle), []);

  return { ...state, begin, answer, finish, reset };
}
