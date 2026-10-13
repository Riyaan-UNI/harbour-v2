/* Hand-written validators. No validation library, per the stack lock. */

export function badInput(message) {
  const error = new Error(message);
  error.code = "BAD_INPUT";
  return error;
}

export function asString(value, { max = 2000, field = "value" } = {}) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw badInput(`${field} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw badInput(`Please keep ${field} under ${max.toLocaleString("en-HK")} characters.`);
  return trimmed;
}

export function asEnum(value, allowed, fallback) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return allowed.includes(candidate) ? candidate : fallback;
}

export function asBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function asStringArray(value, { max = 20, each = 160 } = {}) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, max)
    .map(item => (typeof item === "string" ? item.trim().slice(0, each) : ""))
    .filter(Boolean);
}

export function asNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Throws unless every required key has a non-empty value. */
export function requireFields(source, keys) {
  const missing = keys.filter(key => {
    const value = source?.[key];
    return value === undefined || value === null || (typeof value === "string" && !value.trim());
  });
  if (missing.length) throw badInput(`Please add: ${missing.join(", ")}.`);
  return source;
}
