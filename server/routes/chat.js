import { Router } from "express";
import { askAI } from "../ai/client.js";
import { chatPrompt } from "../ai/prompts.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";

const router = Router();

/* This route is public, unauthenticated, and it calls a paid model, so it is
   bounded like the newer feature routes: a per-IP bucket and a small body cap.
   The guards are attached per route, never with router.use() — this router is
   mounted at "/api", and a path-less use() would throttle every other /api/*
   route. The response shape (`{ reply }` / `{ error }`) is unchanged. */
const limiter = rateLimit({ windowMs: 60_000, max: 30, name: "chat" });
const MAX_MESSAGE = 3000; // mirrors the textarea's maxLength on the client

router.post("/chat", limiter, bodyLimit(16 * 1024), async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Enter a message." });
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: `Please keep your question under ${MAX_MESSAGE.toLocaleString("en-HK")} characters.` });
  }
  try {
    res.json({ reply: await askAI(chatPrompt(message)) });
  } catch (error) {
    // Log the real cause; never hand provider or configuration detail to the client.
    console.warn(`[${req.id}] chat failed:`, error?.message || error);
    res.status(503).json({ error: "Harbour guide is temporarily unavailable." });
  }
});
export default router;
