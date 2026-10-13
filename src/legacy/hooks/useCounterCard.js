import { useCallback, useState } from "react";
import { buildCounterCard } from "../lib/featureApi.js";

export const COUNTER_SCENARIOS = [
  { id: "immigration", label: "Immigration / visa" },
  { id: "clinic", label: "Clinic / hospital" },
  { id: "bank", label: "Bank" },
  { id: "district_office", label: "District office" },
  { id: "landlord", label: "Landlord / agent" },
  { id: "other", label: "Something else" },
];

export const DOCUMENT_OPTIONS = [
  "Passport",
  "Student visa",
  "Identity card",
  "Proof of address",
  "Tenancy agreement",
  "University letter",
  "Bank statement",
  "Appointment slip",
];

/** Hook for the Counter Card mode inside Translate. */
export function useCounterCard(userLang = "en") {
  const [state, setState] = useState({ status: "idle", card: null, error: null });

  const build = useCallback(async ({ scenario, need, documents }) => {
    setState({ status: "loading", card: null, error: null });
    try {
      const card = await buildCounterCard({ scenario, need, documents, userLang });
      setState({ status: "done", card, error: null });
      return card;
    } catch (error) {
      setState({ status: "error", card: null, error });
      return null;
    }
  }, [userLang]);

  const reset = useCallback(() => setState({ status: "idle", card: null, error: null }), []);

  return { ...state, build, reset };
}
