/* Stateless by default. Only drill sessions (TTL) and anonymous counters live in
   memory, and both sit behind this interface so the backing store can be swapped
   for Redis or Postgres without touching the services. */

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_TURNS = 10;
const MAX_SESSIONS = 1000;

const sessions = new Map();
const counters = {
  listingChecks: 0,
  leaseReads: 0,
  counterCards: 0,
  drillsCompleted: 0,
};

function sweep() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.startedAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

export const store = {
  limits: { SESSION_TTL_MS, MAX_TURNS, MAX_SESSIONS },

  createSession(session) {
    sweep();
    while (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
    sessions.set(session.id, session);
    return session;
  },

  getSession(id) {
    const session = sessions.get(id);
    if (!session) return null;
    if (Date.now() - session.startedAt > SESSION_TTL_MS) {
      sessions.delete(id);
      return null;
    }
    return session;
  },

  updateSession(id, patch) {
    const session = this.getSession(id);
    if (!session) return null;
    const next = { ...session, ...patch };
    sessions.set(id, next);
    return next;
  },

  deleteSession(id) {
    return sessions.delete(id);
  },

  increment(counter, by = 1) {
    if (!(counter in counters)) return 0;
    counters[counter] = Math.max(0, counters[counter] + by);
    return counters[counter];
  },

  readCounters() {
    return { ...counters };
  },

  seedCounters(values) {
    for (const [key, value] of Object.entries(values || {})) {
      if (key in counters) counters[key] = Number(value) || 0;
    }
  },

  stats() {
    sweep();
    return { sessions: sessions.size, counters: { ...counters } };
  },
};
