import { CODES } from "./envelope.js";

/* Hand-written token bucket. Each rateLimit() instance owns its own bucket map,
   so a strict limiter on one router never throttles another. Buckets are swept
   periodically so the map cannot grow without bound. */

export function rateLimit({ windowMs = 60_000, max = 20, name = "default" } = {}) {
  const buckets = new Map();

  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt < now) buckets.delete(key);
  }, Math.max(windowMs, 60_000));
  if (typeof sweeper.unref === "function") sweeper.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    res.setHeader("X-RateLimit-Policy", name);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({
        ok: false,
        error: { code: CODES.RATE_LIMITED, message: "That is a lot of requests. Please wait a moment and try again." },
        requestId: req.id,
      });
    }
    next();
  };
}

/* Cheap guard so an oversized body is rejected before it reaches a service. */
export function bodyLimit(bytes) {
  return (req, res, next) => {
    const header = req.headers["content-length"];
    if (header && Number(header) > bytes) {
      return res.status(413).json({
        ok: false,
        error: { code: CODES.BAD_INPUT, message: "That input is too large. Please shorten it and try again." },
        requestId: req.id,
      });
    }
    next();
  };
}
