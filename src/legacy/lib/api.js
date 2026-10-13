/* The API answers in two envelope shapes: the legacy routes put a plain string
   in `error` (e.g. { error: "Enter a message." }), while the newer feature
   routes and the transport-level handlers return { ok: false, error: { code,
   message } }. Normalise both, so a 429 / 413 / 404 from the hardening layer
   reads as a sentence instead of "[object Object]". */
function errorMessage(data) {
  if (typeof data?.error === "string" && data.error) return data.error;
  if (typeof data?.error?.message === "string" && data.error.message) return data.error.message;
  return "Something went wrong. Please try again.";
}

async function request(path, options) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(errorMessage(data));
    error.status = response.status;
    error.code = typeof data?.error?.code === "string" ? data.error.code : data?.code;
    /* A 5xx that is not one of our JSON envelopes is a proxy / gateway / HTML
       error page, i.e. Harbour really is unreachable. An enveloped 5xx means
       Harbour answered but could not complete the work. */
    const enveloped = typeof data?.ok === "boolean" || typeof data?.error !== "undefined";
    error.networkUnavailable = !enveloped && response.status >= 500;
    throw error;
  }
  return data;
}
const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
const get = (path) => request(path);
export const analyzeScam = (text) => post("/api/scam/analyze", { text });
export const translateText = (text) => post("/api/translate", { text });
export const sendChat = (message) => post("/api/chat", { message });
export const getChecklist = (country) => get(`/api/checklist?country=${encodeURIComponent(country || "")}`);
export const getRecentScams = () => get("/api/scams/recent");
export const getServices = () => get("/api/services");
