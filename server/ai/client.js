import { GoogleGenerativeAI } from "@google/generative-ai";

/* Every outbound model call is bounded. Before this, a hung provider held the
   request open forever — the route never responded and the socket leaked. */
const TIMEOUT_MS = Math.max(1_000, Number(process.env.AI_TIMEOUT_MS || 12_000));

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

export function parseJSON(value) {
  const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

const MOCK_REPLY = "In demo mode, Harbour returns a friendly placeholder. In production this would be an AI-powered answer based on your question.";

export async function askAI(prompt, { json = false } = {}) {
  if (process.env.MOCK_AI === "true") {
    return json ? { riskLevel: "medium", issue: "Demo check", explanation: MOCK_REPLY, warningSigns: ["Demo mode is active"], actions: ["No real AI call was made."], support: { name: "Harbour Demo", phone: "18222" } } : MOCK_REPLY;
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await withTimeout(model.generateContent(prompt), TIMEOUT_MS);
      const output = result.response.text();
      return json ? parseJSON(output) : output;
    } catch (error) {
      if (error?.code === "UPSTREAM_TIMEOUT") console.warn("Gemini timed out; trying Groq fallback.");
      else console.warn("Gemini unavailable; trying Groq fallback.", error.message);
    }
  }
  if (process.env.GROQ_API_KEY) {
    const signal = typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS + 500) : undefined;
    const response = await withTimeout(fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.2 }),
      signal,
    }), TIMEOUT_MS + 1_000);
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const payload = await response.json();
    const output = payload.choices?.[0]?.message?.content ?? "";
    return json ? parseJSON(output) : output;
  }
  throw new Error("AI is not configured. Add a Gemini or Groq key in server/.env.");
}
