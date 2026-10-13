import { Router } from "express";
import { CODES, fail, handler, ok } from "../lib/envelope.js";
import { featureEnabled } from "../lib/flags.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";
import { checkListing, getPlaybook, xrayLease } from "../services/rentalService.js";

const router = Router();

router.use(rateLimit({ windowMs: 60_000, max: 20, name: "rental" }));
router.use((req, res, next) => (
  featureEnabled("FEATURE_RENTAL") ? next() : fail(res, CODES.FEATURE_OFF, "Rental Shield is switched off on this deployment.", req)
));

router.post("/listing-check", bodyLimit(64 * 1024), handler(async (req, res) => {
  ok(res, await checkListing(req.body || {}), req);
}));

router.post("/lease-xray", bodyLimit(90 * 1024), handler(async (req, res) => {
  ok(res, await xrayLease(req.body || {}), req);
}));

router.get("/playbook", handler(async (req, res) => {
  const playbook = await getPlaybook();
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("ETag", `"playbook-v1-${playbook.steps.length}"`);
  ok(res, playbook, req);
}));

export default router;
