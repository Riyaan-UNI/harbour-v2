/**
 * Client-side redaction — Addendum 1 rule 5.
 *
 * Ported verbatim from the old build's Shield page (`src/legacy/pages/Shield.jsx`,
 * lines 16–21): the same email, Hong Kong phone, HKID and 13–19-digit card
 * patterns, plus the one-time-code label pass. Keeping the logic identical is
 * what makes the old build's behaviour carry over — the new page shows the
 * count through `RedactionNotice` instead of an inline line, but the hiding
 * itself must match what was already shipped and understood.
 *
 * The `hxxps://` scheme in the fictional sample text is deliberately safe:
 * none of these patterns match it, and the unit test pins that.
 */

/** What the redactor hides, and how many items it hid. */
export type RedactionResult = {
  text: string;
  count: number;
};

/**
 * Hide common private identifiers in-place, replacing each with `[hidden]`.
 *
 * Two passes, sharing one counter: the identifier patterns (email, HK phone,
 * HKID, card number) first, then the one-time-code pattern where the label is
 * kept and only the digits are hidden. The label matters — "one-time code
 * [hidden]" still reads as a sentence.
 */
export function redactPrivateInfo(value: string): RedactionResult {
  let count = 0;
  let text = value.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:\+?852[-\s]?)?[2-9]\d{3}[-\s]?\d{4}\b|\b[A-Z]{1,2}\d{6}\(?[0-9A]\)?\b|\b(?:\d[ -]?){13,19}\b/gi,
    () => {
      count += 1;
      return '[hidden]';
    },
  );
  text = text.replace(
    /(\b(?:otp|one[- ]time (?:code|password)|verification code)\s*(?:is|:)?\s*)(\d{4,8}\b)/gi,
    (_match, label) => {
      count += 1;
      return `${label}[hidden]`;
    },
  );
  return { text, count };
}
