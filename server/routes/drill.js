import { Router } from "express";
import { CODES, fail, handler, ok } from "../lib/envelope.js";
import { featureEnabled } from "../lib/flags.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";
import { drillTurn, finishDrill, startDrill } from "../services/drillService.js";

const router = Router();

/* Per-route guards: a path-less router.use() here would leak this bucket onto
   every other /api/* route. See counterCard.js for the full explanation. */
const limiter = rateLimit({ windowMs: 60_000, max: 40, name: "drill" });
const requireFeature = (req, res, next) => (
  featureEnabled("FEATURE_DRILL") ? next() : fail(res, CODES.FEATURE_OFF, "Scam Drill is switched off on this deployment.", req)
);

router.post("/drill/start", limiter, requireFeature, bodyLimit(16 * 1024), handler(async (req, res) => {
  ok(res, await startDrill(req.body || {}), req);
}));

router.post("/drill/:id/turn", limiter, requireFeature, bodyLimit(16 * 1024), handler(async (req, res) => {
  ok(res, await drillTurn(req.params.id, req.body || {}), req);
}));

router.post("/drill/:id/finish", limiter, requireFeature, bodyLimit(16 * 1024), handler(async (req, res) => {
  ok(res, finishDrill(req.params.id), req);
}));

export default router;
