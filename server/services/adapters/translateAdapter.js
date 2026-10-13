import { translateToCantonese } from "../../ai/baidu.js";

/* Thin adapter over the existing translation service. Harbour only ships a
   Cantonese translator today, so anything else is drafted by the model and this
   adapter simply reports that it cannot help. */

const CANTONESE = ["yue", "zh-hk", "zh-hant", "cantonese"];

export function isCantonese(lang) {
  const value = String(lang || "").toLowerCase();
  return CANTONESE.some(code => value === code || value.startsWith(`${code}-`));
}

export async function translateToStaffLanguage(text, lang) {
  if (!isCantonese(lang)) return null;
  try {
    return await translateToCantonese(text);
  } catch {
    return null;
  }
}
