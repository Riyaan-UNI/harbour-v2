/**
 * The fictional sample message the Scam X-ray demonstrates with.
 *
 * Ported verbatim from the old build's Shield page. The `hxxps://` scheme is
 * deliberate: it looks like a link to a reader and is inert to a browser, so
 * the sample can never become a live payment link. Both the tool's "use
 * fictional sample" action and the SAMPLE read panel render this exact
 * string, and the e2e spec pins it.
 */
export const SAMPLE_MESSAGE =
  'Your parcel is waiting. Pay a small redelivery fee now: hxxps://hk-post.example/claim. Reply with your bank card details to avoid return.';
