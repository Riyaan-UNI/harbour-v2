import { createHash } from "node:crypto";

/* Tiny LRU + TTL cache. Used to answer repeat listings and lease texts without
   another model call. Process-local by design; swap for Redis behind the same
   interface when the app scales out. */
const DEFAULT_TTL = 10 * 60 * 1000;
const DEFAULT_MAX = 300;

const entries = new Map();

export function cacheKey(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function cacheGet(key) {
  const hit = entries.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    entries.delete(key);
    return undefined;
  }
  // Refresh recency.
  entries.delete(key);
  entries.set(key, hit);
  return hit.value;
}

export function cacheSet(key, value, { ttl = DEFAULT_TTL, max = DEFAULT_MAX } = {}) {
  entries.set(key, { value, expiresAt: Date.now() + ttl });
  while (entries.size > max) entries.delete(entries.keys().next().value);
  return value;
}

export async function cached(key, producer, options) {
  const hit = cacheGet(key);
  if (hit !== undefined) return hit;
  const value = await producer();
  return cacheSet(key, value, options);
}

export function cacheStats() {
  return { size: entries.size };
}
