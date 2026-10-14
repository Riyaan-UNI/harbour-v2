import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scamRouter from "./routes/scam.js";
import translateRouter from "./routes/translate.js";
import chatRouter from "./routes/chat.js";
import dataRouter from "./routes/data.js";
import rentalRouter from "./routes/rental.js";
import counterCardRouter from "./routes/counterCard.js";
import drillRouter from "./routes/drill.js";
import impactRouter from "./routes/impact.js";
import { requestId } from "./lib/envelope.js";
import { flags } from "./lib/flags.js";
import { apiNotFound, errorHandler, originPolicy, readiness, securityHeaders } from "./lib/http.js";

dotenv.config();

const app = express();

// Do not advertise the framework.
app.disable("x-powered-by");
// Trust forwarding headers only when the deployment topology is configured.
const trustProxyHops = process.env.TRUST_PROXY?.trim()
  ? Number(process.env.TRUST_PROXY)
  : 0;
if (!Number.isSafeInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error("TRUST_PROXY must be a non-negative integer.");
}
app.set("trust proxy", trustProxyHops);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);
const isAllowedOrigin = originPolicy(allowedOrigins);

app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Request-Id"],
  exposedHeaders: ["X-Request-Id", "X-RateLimit-Remaining", "Retry-After"],
  maxAge: 600,
}));
app.use(requestId);
app.use(express.json());
app.use("/api/scam", scamRouter);
app.use("/api", translateRouter);
app.use("/api", chatRouter);
app.use("/api", dataRouter);
app.use("/api/rental", rentalRouter);
app.use("/api", counterCardRouter);
app.use("/api", drillRouter);
app.use("/api", impactRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", flags: flags() });
});

// Readiness is separate from liveness: it reports whether the JSON data the API
// serves is actually readable, and returns 503 when it is not.
app.get("/api/ready", async (req, res) => {
  const state = await readiness();
  res.status(state.ok ? 200 : 503).json({ ok: state.ok, data: state, requestId: req.id });
});

// Must stay last: JSON 404 for unknown routes, then the single error sink.
app.use(apiNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown: stop accepting connections, let in-flight requests finish,
// then exit. The timer is a hard stop so a stuck socket cannot block a deploy.
function shutdown(signal) {
  console.log(`[${signal}] shutting down`);
  const hardStop = setTimeout(() => process.exit(1), 10_000);
  if (typeof hardStop.unref === "function") hardStop.unref();
  server.close(() => {
    clearTimeout(hardStop);
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
