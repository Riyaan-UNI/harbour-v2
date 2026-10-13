import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { askAI } from "../ai/client.js";
import { flags } from "../lib/flags.js";
import { redact } from "../lib/redact.js";

/* The only place in the server that calls a model.
   Provider preference is honoured by the existing ai/client.js chain
   (Gemini, then Groq), so no provider logic is duplicated here. */

const promptDir = fileURLToPath(new URL("../prompts/", import.meta.url));

const TASKS = {
  "listing-extract": { file: "listing-extract.txt", timeoutMs: 8000 },
  "lease-xray": { file: "lease-xray.txt", timeoutMs: 8000 },
  "counter-card": { file: "counter-card.txt", timeoutMs: 8000 },
  "drill-turn": { file: "drill-turn.txt", timeoutMs: 8000 },
};

const promptCache = new Map();

async function loadTemplate(file) {
  if (!promptCache.has(file)) promptCache.set(file, await readFile(path.join(promptDir, file), "utf8"));
  return promptCache.get(file);
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("Upstream timed out");
      error.code = "UPSTREAM_TIMEOUT";
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function fill(template, replacements) {
  let output = template;
  for (const [key, value] of Object.entries(replacements || {})) {
    output = output.split(`{{${key}}}`).join(Array.isArray(value) ? value.join(", ") : String(value ?? ""));
  }
  return output;
}

/**
 * Runs a versioned prompt and returns validated JSON, or null so the caller can
 * fall back to its rules-only result. Never throws a raw model error upward.
 */
export async function llmJson(task, replacements, validate) {
  if (flags().MOCK_AI) return null; // deterministic mode: zero API calls
  const config = TASKS[task];
  if (!config) return null;

  const base = fill(await loadTemplate(config.file), replacements);
  // Final safety net before anything leaves the process.
  const safe = redact(base).text;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const prompt = attempt === 0
      ? safe
      : `${safe}\n\nYour previous reply could not be parsed. Reply with valid JSON only, matching the shape described above.`;
    try {
      const value = await withTimeout(askAI(prompt, { json: true }), config.timeoutMs);
      if (!validate || validate(value)) return value;
    } catch (error) {
      if (error?.code === "UPSTREAM_TIMEOUT") return null;
      console.warn(`llmRouter(${task}) attempt ${attempt + 1} failed:`, error?.message || error);
    }
  }
  return null;
}
