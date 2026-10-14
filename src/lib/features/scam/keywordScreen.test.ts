import { describe, expect, it } from 'vitest';
import { screenScam } from './keywordScreen';

describe('screenScam', () => {
  it('returns High when two or more indicator groups match', () => {
    const result = screenScam('URGENT: verify your bank details now.');
    expect(result.riskLevel).toBe('High');
    expect(result.issue).toBe('Potential social engineering');
  });

  it('returns Medium when exactly one indicator group matches', () => {
    const result = screenScam('Your redelivery fee is due.');
    expect(result.riskLevel).toBe('Medium');
  });

  it('returns Low when no indicator group matches', () => {
    const result = screenScam('Are we still meeting tomorrow at noon?');
    expect(result.riskLevel).toBe('Low');
    expect(result.issue).toBe('No obvious scam pattern found');
    expect(result.warningSigns).toEqual([
      'A basic scan found no common warning words; this does not prove the message is safe.',
    ]);
  });

  it('matches the indicator groups case-insensitively', () => {
    expect(screenScam('OTP required').riskLevel).toBe('Medium');
    expect(screenScam('Please VERIFY your identity').riskLevel).toBe('Medium');
    expect(screenScam('URGENT! verify now').riskLevel).toBe('High');
  });

  it('always states what the read is and what it cannot tell you', () => {
    for (const text of ['URGENT: verify your bank details now.', 'Lunch at one?']) {
      expect(screenScam(text).explanation).toBe(
        'This is a basic keyword screen only. It cannot confirm whether a message is genuine.',
      );
    }
  });

  it('always offers the same two actions and the helpline', () => {
    const result = screenScam('Your fee is due');
    expect(result.actions).toEqual([
      'Do not share passwords or one-time codes.',
      'Contact the organisation using a phone number from its official website.',
    ]);
    expect(result.support).toEqual({
      name: 'Hong Kong Police Anti-Scam Helpline',
      phone: '18222',
    });
  });

  it('returns a fresh support object per call', () => {
    const first = screenScam('Pay the fee');
    first.support.phone = 'changed';
    expect(screenScam('Pay the fee').support.phone).toBe('18222');
  });
});
