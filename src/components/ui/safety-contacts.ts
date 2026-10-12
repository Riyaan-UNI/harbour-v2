/**
 * The safety numbers, kept out of `safety-rail.tsx` so that file exports only a
 * component.
 *
 * SOURCE OF THE NUMBERS: copied from the previous build's constants in
 * `Harbour/harbour/client/src/pages/Home.jsx` (the `emergency` array, lines
 * 25-27): 999, 18222 and 2824 6111. The Hospital Authority line is NOT in that
 * repo — Addendum 1 §2 names it but the old build never held it — so the value
 * below comes from the Government Telephone Directory
 * (tel.directory.gov.hk/HA_ENG.html, HA office tel) and is the one number here
 * with no old-repo source.
 *
 * EVERY NUMBER IS UNVERIFIED until it is confirmed against the official source.
 * Do not ship a number that has not been checked: a wrong emergency number is
 * worse than no rail at all. The `tel:` href is the digits only, so the spaces
 * in the displayed form never break the dial.
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

/** UNVERIFIED — see the note above before this ships. */
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
    detail: 'Hong Kong Police · 24-hour consultation',
    tel: '18222',
  },
  {
    id: 'immigration',
    name: 'Immigration enquiries',
    number: '2824 6111',
    detail: 'Immigration Department',
    tel: '28246111',
  },
  {
    id: 'hospital',
    name: 'Hospital Authority enquiry',
    number: '2300 6555',
    detail: 'Hospital Authority',
    tel: '23006555',
  },
];

export type SafetyRailVariant = 'compact' | 'expanded';
