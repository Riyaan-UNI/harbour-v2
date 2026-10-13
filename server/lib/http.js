/* Transport-level hardening.
 *
 * Before this existed the server had no global error handler and no 404
 * handler, so a malformed JSON body, an oversized body, or a request to an
 * unknown route all fell through to Express's default HTML error page — a
 * stack trace in development, and a body neither client could parse.
 *
 * The error envelope deliberately keeps `error` as a plain string. The
 * original client (`client/src/lib/api.js`) reads `data.error` directly, while
 * the feature client reads `ok` + `error.code`; a string plus `ok:false` and
 * `code` satisfies both without changing any existing success response.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

/** Conservative security headers. No dependency required. */
export function securityHeaders(req, res, next) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  next();
}

function envelope(code, message, req) {
  return { ok: false, error: message, code, requestId: req?.id };
}

/** Any route the server does not own returns JSON, never Express's HTML page. */
export function apiNotFound(req, res) {
  res.status(404).json(envelope("NOT_FOUND", "That Harbour endpoint does not exist.", req));
}

/** Single error sink: everything becomes a clean, non-leaking JSON envelope. */
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = Number(error?.status || error?.statusCode) || 0;

  if (error?.type === "entity.too.large" || status === 413) {
    return res.status(413).json(envelope("PAYLOAD_TOO_LARGE", "That input is too large. Please shorten it and try again.", req));
  }
  if (error?.type === "entity.parse.failed" || status === 400) {
    return res.status(400).json(envelope("BAD_INPUT", "That request could not be read. Please try again.", req));
  }
  if (status === 429) {
    return res.status(429).json(envelope("RATE_LIMITED", "That is a lot of requests. Please wait a moment and try again.", req));
  }

  console.warn(`[${req?.id}] unhandled error on ${req?.method} ${req?.originalUrl}:`, error?.message || error);
  res.status(500).json(envelope("UPSTREAM_FAILED", "Harbour could not complete that right now. Please try again.", req));
}

/* ------------------------------------------------------------------ *
 * Readiness: the API is ready when the JSON data it serves is readable.
 * A missing or corrupt data file is a real 503, unlike a missing AI key
 * (the app degrades to its rules-only answers on purpose).
 * ------------------------------------------------------------------ */

const dataDir = fileURLToPath(new URL("../data/", import.meta.url));
const REQUIRED_DATA = ["checklist.json", "scams.json", "services.json", "rental-playbook.json", "glossary.json"];

export async function readiness() {
  const checks = {};
  await Promise.all(REQUIRED_DATA.map(async file => {
    try {
      JSON.parse(await readFile(path.join(dataDir, file), "utf8"));
      checks[file] = "ok";
    } catch {
      checks[file] = "unavailable";
    }
  }));
  return { ok: Object.values(checks).every(value => value === "ok"), checks };
}

/**
 * Resolves the browser origins allowed to call the API.
 * No Origin header (same-origin requests, curl, health probes) is always
 * allowed; anything else must be localhost, a Vercel preview, or explicitly
 * listed in ALLOWED_ORIGINS.
 */
export function originPolicy(allowedOrigins) {
  const local = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
  const deploy = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i;
  const explicit = new Set(allowedOrigins);
  return origin => {
    if (!origin) return true;
    return local.test(origin) || deploy.test(origin) || explicit.has(origin);
  };
}
