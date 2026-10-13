import { Router } from "express";
import { translateToCantonese } from "../ai/baidu.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";

const router = Router();

/* Public and unauthenticated, and it calls a paid translation API. The guards
   are attached per route, never with router.use() — this router is mounted at
   "/api", and a path-less use() would throttle every other /api/* route.
   The response shape (`{ translation }` / `{ error }`) is unchanged. */
const limiter = rateLimit({ windowMs: 60_000, max: 30, name: "translate" });
const MAX_TEXT = 5000;

router.post("/translate", limiter, bodyLimit(32 * 1024), async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "Enter text to translate." });
  if (text.length > MAX_TEXT) return res.status(400).json({ error: "Please keep the text under 5,000 characters." });
  if (process.env.MOCK_AI === "true") {
    return res.json({ translation: `【演示模式】${text}` });
  }
  try {
    res.json({ translation: await translateToCantonese(text) });
  } catch (error) {
    console.warn(`[${req.id}] translate failed:`, error?.message || error);
    res.status(503).json({ error: "Translation is temporarily unavailable." });
  }
});
export default router;
