import { Router } from "express";
import { askAI } from "../ai/client.js";
import { chatPrompt } from "../ai/prompts.js";
import { bodyLimit, rateLimit } from "../lib/limits.js";

const router = Router();

/* This route is public, unauthenticated, and it calls a paid model, so it is
   bounded like the newer feature routes: a per-IP bucket and a small body cap.
   The guards are attached per route, never with router.use() — this router is
   mounted at "/api", and a path-less use() would throttle every other /api/*
   route. */
const limiter = rateLimit({ windowMs: 60_000, max: 30, name: "chat" });
const MAX_MESSAGE = 3000; // mirrors the textarea's maxLength on the client
const MAX_HISTORY_ENTRIES = 12;
const MAX_HISTORY_ENTRY_LENGTH = 1500;

function isValidHistoryEntry(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    (entry.role === "user" || entry.role === "harbour") &&
    typeof entry.content === "string" &&
    entry.content.length <= MAX_HISTORY_ENTRY_LENGTH
  );
}

router.post("/chat", limiter, bodyLimit(16 * 1024), async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Enter a message." });
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: `Please keep your question under ${MAX_MESSAGE.toLocaleString("en-HK")} characters.` });
  }

  /* History is optional. When provided it is bounded, filtered and sliced
     so the total request body stays inside the 16 KB body cap. */
  const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
  const history = rawHistory
    .filter(isValidHistoryEntry)
    .slice(-MAX_HISTORY_ENTRIES);

  try {
    const reply = await askAI(chatPrompt(message, history));
    const envelope = { reply };
    if (process.env.MOCK_AI === "true") {
      envelope.demo = true;
    }
    res.json(envelope);
  } catch (error) {
    // Log the real cause; never hand provider or configuration detail to the client.
    console.warn(`[${req.id}] chat failed:`, error?.message || error);
    res.status(503).json({ error: "Harbour guide is temporarily unavailable." });
  }
});

export default router;
