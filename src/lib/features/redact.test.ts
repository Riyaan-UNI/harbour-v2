import { describe, expect, it } from 'vitest';
import { redactPrivateInfo } from './redact';

describe('redactPrivateInfo', () => {
  it('hides an email address and counts it once', () => {
    const result = redactPrivateInfo('Write to me at sam.lee@example.com please.');
    expect(result.text).toBe('Write to me at [hidden] please.');
    expect(result.count).toBe(1);
  });

  it('hides a Hong Kong phone number', () => {
    expect(redactPrivateInfo('Call me on 91234567 anytime.')).toEqual({
      text: 'Call me on [hidden] anytime.',
      count: 1,
    });
  });

  it('hides a Hong Kong phone number written with the country prefix', () => {
    // Verbatim legacy behaviour: the match starts at the digits, so the "+"
    // stays behind. Pinned, not fixed — this brick ports the old build's
    // hiding behaviour exactly.
    expect(redactPrivateInfo('Call +852 9123 4567 now.')).toEqual({
      text: 'Call +[hidden] now.',
      count: 1,
    });
  });

  it('hides an HKID with its check digit', () => {
    // Verbatim legacy behaviour: the trailing ")" stays behind, because the
    // ported pattern ends its boundary at the check digit. Pinned, not fixed —
    // this brick ports the old build's hiding behaviour exactly.
    expect(redactPrivateInfo('My HKID is A123456(7), ok?')).toEqual({
      text: 'My HKID is [hidden]), ok?',
      count: 1,
    });
  });

  it('hides a card number written without separators', () => {
    // The card pattern's trailing "[ -]?" eats the space after the number —
    // verbatim legacy behaviour, pinned not fixed. The count is still one.
    expect(redactPrivateInfo('Card 4111111111111111 thanks')).toEqual({
      text: 'Card [hidden]thanks',
      count: 1,
    });
  });

  it('hides the leading digits of a spaced card number', () => {
    // Verbatim legacy behaviour: the phone alternative matches the first eight
    // digits of a 16-digit card, so only those hide. Patterns can miss things —
    // exactly what the on-screen notice says. Pinned, not fixed.
    expect(redactPrivateInfo('Card: 4111 1111 1111 1111 thanks')).toEqual({
      text: 'Card: [hidden] 1111 1111 thanks',
      count: 1,
    });
  });

  it('keeps the one-time-code label and hides only the digits', () => {
    expect(redactPrivateInfo('Your one-time code is 123456. Do not share it.')).toEqual({
      text: 'Your one-time code is [hidden]. Do not share it.',
      count: 1,
    });
  });

  it('counts every pattern it hides in one message', () => {
    const result = redactPrivateInfo(
      'Mail sam@example.com or call 91234567 about A123456(7). The verification code: 998877 arrived too.',
    );
    expect(result.count).toBe(4);
    expect(result.text).not.toContain('sam@example.com');
    expect(result.text).not.toContain('91234567');
    expect(result.text).not.toContain('A123456');
    expect(result.text).not.toContain('998877');
  });

  it('leaves the deliberately unclickable hxxps sample scheme untouched', () => {
    const sample =
      'Your parcel is waiting. Pay a small redelivery fee now: hxxps://hk-post.example/claim.';
    const result = redactPrivateInfo(sample);
    expect(result.count).toBe(0);
    expect(result.text).toBe(sample);
  });

  it('leaves ordinary text alone', () => {
    expect(redactPrivateInfo('Are we still meeting tomorrow at noon?')).toEqual({
      text: 'Are we still meeting tomorrow at noon?',
      count: 0,
    });
  });

  it('handles an empty message', () => {
    expect(redactPrivateInfo('')).toEqual({ text: '', count: 0 });
  });
});
