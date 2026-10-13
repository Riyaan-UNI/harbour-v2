import { flags } from "../lib/flags.js";
import { store } from "../lib/store.js";

/* Anonymous aggregate counters only. No identifiers are collected, and a
   counter is only shown in the UI once it reaches MIN_DISPLAY. */

export const SDGS = [
  { id: "10", label: "Reduced inequalities", note: "Plain-language guidance for students who are far from home." },
  { id: "11", label: "Sustainable cities and communities", note: "Safer renting and a calmer settling-in process." },
  { id: "16", label: "Peace, justice and strong institutions", note: "Knowing the official route when something goes wrong." },
];

export const MIN_DISPLAY = 5;

export const EVENT_NAMES = ["listingChecks", "leaseReads", "counterCards", "drillsCompleted"];

let seeded = false;

export function getImpact() {
  if (flags().MOCK_AI && !seeded) {
    // Deterministic demo baseline so the panel is meaningful during rehearsals.
    store.seedCounters({ listingChecks: 128, leaseReads: 46, counterCards: 73, drillsCompleted: 39 });
    seeded = true;
  }
  return {
    counters: store.readCounters(),
    sdgs: SDGS.map(sdg => sdg.id),
    sdgDetails: SDGS,
    minDisplay: MIN_DISPLAY,
  };
}

export function recordEvent(name) {
  if (!EVENT_NAMES.includes(name)) return null;
  return store.increment(name, 1);
}
