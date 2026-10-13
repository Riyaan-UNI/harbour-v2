/* Redaction runs before any outbound model call. Pasted text is never logged,
   never persisted, and is discarded once the response is built. */

const PATTERNS = [
  // Longest / most specific patterns first: an 8-digit phone rule running
  // before the card rule would swallow the first half of a 16-digit card and
  // leave the rest in the clear.
  { id: "EMAIL", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  // No trailing \b after the bracket: "(7)" ends on a non-word char, so a \b
  // there would leave a dangling ")" behind after redaction.
  { id: "HKID", re: /\b[A-Z]{1,2}\d{6}\(?[0-9A]\)?/gi },
  { id: "OTP", re: /(\b(?:otp|one[- ]time (?:code|password)|verification code)\s*(?:is|:)?\s*)(\d{4,8}\b)/gi },
  // Digit-delimited so a trailing separator is never swallowed (the old
  // (?:\d[ -]?){9,19} ate the space after an account number). Nine or more
  // digits covers cards and bank accounts.
  { id: "BANK", re: /\b\d(?:[ -]?\d){8,18}\b/g },
  { id: "PHONE", re: /\b(?:\+?852[-\s]?)?[2-9]\d{3}[-\s]?\d{4}\b/g },
];

export function redact(value) {
  let count = 0;
  let text = String(value ?? "");
  for (const { re } of PATTERNS) {
    text = text.replace(re, (match, ...rest) => {
      count += 1;
      /* A replace callback receives (match, p1…pn, offset, string). Dropping the
         last two entries leaves only real capture groups — using the second
         argument directly (as this once did) injects the match OFFSET into the
         text for every pattern with no capture group. */
      const groups = rest.slice(0, Math.max(0, rest.length - 2));
      // Preserve a label when the pattern carries one (e.g. "OTP: 123456").
      const label = groups.find(group => typeof group === "string" && group.trim());
      return label ? `${label}[redacted]` : "[redacted]";
    });
  }
  return { text, count };
}

export function redactList(values) {
  let count = 0;
  const text = (Array.isArray(values) ? values : []).map(value => {
    const result = redact(value);
    count += result.count;
    return result.text;
  });
  return { text, count };
}
