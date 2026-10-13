import { Router } from "express";
import { askAI } from "../ai/client.js";
import { scamPrompt } from "../ai/prompts.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";

const router = Router();

/* Public, unauthenticated, and it calls a paid model — bounded like the newer
   feature routes. The response shape is unchanged: either the model's result or
   the deterministic keyword fallback. */
router.use(rateLimit({ windowMs: 60_000, max: 30, name: "scam" }));
router.use(bodyLimit(32 * 1024));

const fallback = (text) => {
  const indicators = [/urgent|immediately|today/i, /password|one.time.code|otp/i, /bank|payment|transfer|fee/i, /click|link|verify/i];
  const matches = indicators.filter((pattern) => pattern.test(text)).length;
  return {
    riskLevel: matches >= 2 ? "High" : matches === 1 ? "Medium" : "Low",
    issue: matches ? "Potential social engineering" : "No obvious scam pattern found",
    explanation: "Automated AI review is unavailable, so this is a basic keyword screen only. It cannot confirm whether a message is genuine.",
    warningSigns: matches ? ["The message contains language commonly used to pressure people or request sensitive information."] : ["A basic scan found no common warning words; this does not prove the message is safe."],
    actions: ["Do not share passwords or one-time codes.", "Contact the organisation using a phone number from its official website."],
    support: { name: "Hong Kong Police Anti-Scam Helpline", phone: "18222" },
  };
};

router.post("/analyze", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "Enter a message to analyze." });
  if (text.length > 8000) return res.status(400).json({ error: "Please keep the message under 8,000 characters." });
  try {
    const result = await askAI(scamPrompt(text), { json: true });
    const riskLevel = ["Low", "Medium", "High"].includes(result.riskLevel) ? result.riskLevel : "Medium";
    res.json({ riskLevel, issue: String(result.issue || "Potential scam"), explanation: String(result.explanation || "Review carefully."), warningSigns: Array.isArray(result.warningSigns) ? result.warningSigns : [], actions: Array.isArray(result.actions) ? result.actions : [], support: result.support?.name && result.support?.phone ? result.support : fallback(text).support });
  } catch (error) {
    console.warn("Scam analysis fallback:", error.message);
    res.json(fallback(text));
  }
});

export default router;
