import { Router } from "express";
import { CODES, fail, handler, ok } from "../lib/envelope.js";
import { featureEnabled } from "../lib/flags.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";
import { buildCounterCard } from "../services/counterCardService.js";

const router = Router();

/* Guards are attached PER ROUTE, not with router.use().
   Six routers share the "/api" prefix, and a path-less router.use() inside a
   router mounted at "/api" runs for EVERY /api/* request — so a plain
   GET /api/checklist used to consume the counter-card, drill, impact, chat and
   translate buckets and start returning 429 after ~20 loads. */
const limiter = rateLimit({ windowMs: 60_000, max: 20, name: "counter-card" });
const requireFeature = (req, res, next) => (
  featureEnabled("FEATURE_COUNTER_CARD") ? next() : fail(res, CODES.FEATURE_OFF, "Counter Card is switched off on this deployment.", req)
);

router.post("/counter-card", limiter, requireFeature, bodyLimit(32 * 1024), handler(async (req, res) => {
  ok(res, await buildCounterCard(req.body || {}), req);
}));

export default router;
