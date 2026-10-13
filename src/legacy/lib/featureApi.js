/* Envelope-aware client for the new SDG feature routes.
   Existing endpoints keep using lib/api.js and its response shape. */

const BASE = "/api";

async function call(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error?.message || "Harbour could not complete that request.");
    error.code = payload?.error?.code || `HTTP_${response.status}`;
    error.status = response.status;
    error.networkUnavailable = response.status >= 500;
    throw error;
  }
  return payload.data;
}

export const checkRentalListing = input => call("/rental/listing-check", { method: "POST", body: input });
export const xrayLease = text => call("/rental/lease-xray", { method: "POST", body: { text } });
export const getRentalPlaybook = () => call("/rental/playbook");
export const buildCounterCard = input => call("/counter-card", { method: "POST", body: input });
export const startDrill = scamType => call("/drill/start", { method: "POST", body: { scamType } });
export const drillTurn = (sessionId, optionId) => call(`/drill/${encodeURIComponent(sessionId)}/turn`, { method: "POST", body: { optionId } });
export const finishDrill = sessionId => call(`/drill/${encodeURIComponent(sessionId)}/finish`, { method: "POST", body: {} });
export const getImpact = () => call("/impact");

/** Fire-and-forget. The UI never waits for a counter. */
export function recordEvent(name) {
  return call("/events", { method: "POST", body: { name } }).catch(() => null);
}
