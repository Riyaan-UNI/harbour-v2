import { Router } from "express";
import { CODES, fail, handler, ok } from "../lib/envelope.js";
import { featureEnabled } from "../lib/flags.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";
import { EVENT_NAMES, getImpact, recordEvent } from "../services/impactService.js";

const router = Router();

/* Per-route guards: a path-less router.use() here would leak this bucket onto
   every other /api/* route. See counterCard.js for the full explanation. */
const limiter = rateLimit({ windowMs: 60_000, max: 60, name: "impact" });
const requireFeature = (req, res, next) => (
  featureEnabled("FEATURE_IMPACT") ? next() : fail(res, CODES.FEATURE_OFF, "Impact tracking is switched off on this deployment.", req)
);

router.post("/events", limiter, requireFeature, bodyLimit(4 * 1024), handler(async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!EVENT_NAMES.includes(name)) return fail(res, CODES.BAD_INPUT, "Unknown event name.", req);
  ok(res, { name, total: recordEvent(name) }, req);
}));

router.get("/impact", limiter, handler(async (req, res) => {
  if (!featureEnabled("FEATURE_IMPACT")) return fail(res, CODES.FEATURE_OFF, "The impact panel is switched off on this deployment.", req);
  res.setHeader("Cache-Control", "no-store");
  ok(res, getImpact(), req);
}));

export default router;
