import { Router } from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cacheKey, cached } from "../lib/cache.js";

const router = Router();
const dataDir = fileURLToPath(new URL("../data/", import.meta.url));

/* These files never change while the process runs, but the routes used to read
   and re-parse them from disk on every request. Cache the parsed value for ten
   minutes through the shared LRU. Response bodies are unchanged. */
const DATA_TTL_MS = 10 * 60 * 1000;
async function readData(name) {
  return cached(cacheKey(`data:${name}`), async () => JSON.parse(await readFile(path.join(dataDir, name), "utf8")), { ttl: DATA_TTL_MS });
}

function serve(res, payload) {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(payload);
}

router.get("/checklist", async (req, res) => {
  try {
    const country = String(req.query.country || "").toUpperCase();
    const rows = await readData("checklist.json");
    serve(res, rows.filter((item) => !item.countries?.length || item.countries.includes(country)));
  } catch { res.status(500).json({ error: "Checklist data could not be loaded." }); }
});
router.get("/scams/recent", async (_req, res) => { try { serve(res, await readData("scams.json")); } catch { res.status(500).json({ error: "Scam data could not be loaded." }); } });
router.get("/services", async (_req, res) => { try { serve(res, await readData("services.json")); } catch { res.status(500).json({ error: "Service data could not be loaded." }); } });
export default router;
