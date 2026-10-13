import { createHash } from "node:crypto";

/* Bounded like every other upstream call, so a stalled Baidu response cannot
   hold a request (and its socket) open indefinitely. */
const TIMEOUT_MS = Math.max(1_000, Number(process.env.TRANSLATE_TIMEOUT_MS || 10_000));

export async function translateToCantonese(text) {
  const { BAIDU_APP_ID: appId, BAIDU_SECRET_KEY: secret } = process.env;
  if (!appId || !secret) throw new Error("Translation is not configured. Add Baidu credentials in server/.env.");
  const salt = String(Date.now());
  const sign = createHash("md5").update(`${appId}${text}${salt}${secret}`).digest("hex");
  const params = new URLSearchParams({ q: text, from: "auto", to: "yue", appid: appId, salt, sign });
  const signal = typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS) : undefined;
  let response;
  try {
    response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`, { signal });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") throw new Error("Translation took too long. Please try again.");
    throw error;
  }
  const data = await response.json();
  if (!response.ok || data.error_code || !data.trans_result?.length) throw new Error(data.error_msg || "Translation failed.");
  return data.trans_result.map((part) => part.dst).join("\n");
}
