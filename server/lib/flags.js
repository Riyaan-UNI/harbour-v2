const truthy = value => ["true", "1", "yes", "on"].includes(String(value).toLowerCase());

/** Flags are read from env only. Nothing is hardcoded or persisted. */
export function flags() {
  const read = (name, fallback) => (process.env[name] === undefined || process.env[name] === "" ? fallback : truthy(process.env[name]));
  return {
    MOCK_AI: truthy(process.env.MOCK_AI),
    FEATURE_RENTAL: read("FEATURE_RENTAL", true),
    FEATURE_COUNTER_CARD: read("FEATURE_COUNTER_CARD", true),
    FEATURE_DRILL: read("FEATURE_DRILL", true),
    FEATURE_IMPACT: read("FEATURE_IMPACT", true),
  };
}

export function featureEnabled(name) {
  return Boolean(flags()[name]);
}
