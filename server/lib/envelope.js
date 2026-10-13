import { randomUUID } from "node:crypto";

export const CODES = {
  BAD_INPUT: "BAD_INPUT",
  RATE_LIMITED: "RATE_LIMITED",
  UPSTREAM_TIMEOUT: "UPSTREAM_TIMEOUT",
  UPSTREAM_FAILED: "UPSTREAM_FAILED",
  FEATURE_OFF: "FEATURE_OFF",
};

const STATUS_FOR = {
  BAD_INPUT: 400,
  RATE_LIMITED: 429,
  UPSTREAM_TIMEOUT: 504,
  UPSTREAM_FAILED: 502,
  FEATURE_OFF: 404,
};

/** Attaches a stable requestId to every request and mirrors it on the response. */
export function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.id = typeof incoming === "string" && incoming.trim() ? incoming.trim().slice(0, 80) : randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

export function ok(res, data, req) {
  res.json({ ok: true, data, requestId: req?.id });
}

export function fail(res, code, message, req, status) {
  const httpStatus = status || STATUS_FOR[code] || 400;
  res.status(httpStatus).json({ ok: false, error: { code, message }, requestId: req?.id });
}

/** Wraps an async route so upstream failures always become a clean envelope. */
export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      if (error?.code === "UPSTREAM_TIMEOUT") return fail(res, CODES.UPSTREAM_TIMEOUT, "That took too long. Please try again.", req);
      if (error?.code === "BAD_INPUT") return fail(res, CODES.BAD_INPUT, error.message, req);
      console.warn(`[${req.id}] ${req.method} ${req.originalUrl} failed:`, error?.message || error);
      fail(res, CODES.UPSTREAM_FAILED, "Harbour could not complete that right now. Please try again.", req);
    }
  };
}
