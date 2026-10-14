/**
 * The safety numbers, kept out of `safety-rail.tsx` so that file exports only a
 * component.
 *
 * VERIFIED 14 October 2026 against the official sources below. Re-check them
 * before any later release: a wrong emergency number is worse than no rail at
 * all. The `tel:` href is the digits only, so the spaces in the displayed form
 * never break the dial.
 *
 *   999        Emergency services. Named as the emergency number on the Hong
 *              Kong Police Anti-Deception Coordination Centre's contact page.
 *   18222      Anti-Scam Helpline. Run by the Police's Anti-Deception
 *              Coordination Centre (adcc.gov.hk/en-hk/contact-us.html), around
 *              the clock. It gives advice only; it does not take a report.
 *              Someone who has been scammed reports at a police station.
 *   2824 6111  Immigration Department general enquiry hotline
 *              (immd.gov.hk/eng/contactus/index.html). Officers answer
 *              Mon-Fri 8:45-17:15 and Sat 9:00-12:00; closed Sundays and public
 *              holidays. Outside those hours it is an automated menu.
 *   2300 6555  Hospital Authority head-office general enquiry line
 *              (ha.org.hk contact page; tel.directory.gov.hk/HA_ENG.html).
 *              Office hours only, 8:45-17:45, not Saturdays, Sundays or public
 *              holidays. It is an administrative line, not a way to get medical
 *              help, which is why its `detail` points to 999.
 */

export type SafetyContact = {
  id: string;
  name: string;
  /** The display form, e.g. "2824 6111". */
  number: string;
  detail: string;
  /** The digits-only form for the tel: href. */
  tel: string;
};

export const SAFETY_CONTACTS: readonly SafetyContact[] = [
  {
    id: 'emergency',
    name: 'Emergency services',
    number: '999',
    detail: 'Police · Fire · Ambulance',
    tel: '999',
  },
  {
    id: 'anti-scam',
    name: 'Anti-Scam Helpline',
    number: '18222',
    detail: 'Hong Kong Police · 24-hour advice, not a report line',
    tel: '18222',
  },
  {
    id: 'immigration',
    name: 'Immigration enquiries',
    number: '2824 6111',
    detail: 'Immigration Department · Mon–Fri 8:45–17:15, Sat 9:00–12:00',
    tel: '28246111',
  },
  {
    id: 'hospital',
    name: 'Hospital Authority enquiry',
    number: '2300 6555',
    detail: 'Office line, weekdays 8:45–17:45 · for a medical emergency call 999',
    tel: '23006555',
  },
];

export type SafetyRailVariant = 'compact' | 'expanded';
