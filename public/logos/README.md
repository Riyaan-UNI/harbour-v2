# University logos

Bundled files for `src/components/ui/university-logos.ts`. The app resolves a
logo by institution id and never hotlinks an institution's own domain, so these
files are what ships.

## Provenance

Downloaded from Wikipedia / Wikimedia Commons on 13 Oct 2026. **This is a
documented deviation from spec §14**, which asks for each logo to come from the
institution's own official media page. Wikimedia is used because the eight files
are otherwise not available in a single consistent, retrievable form; every file
below is the institution's own published mark, unaltered.

| Id | File | Source file | Wikipedia licence tag |
| --- | --- | --- | --- |
| `hku` | `hku.svg` | `University of Hong Kong Logo.svg` | Fair use |
| `cuhk` | `cuhk.png` | `Emblem of CU.png` | Public domain |
| `hkust` | `hkust.svg` | `Hong Kong University of Science and Technology symbol.svg` | Fair use |
| `polyu` | `polyu.svg` | `Hong Kong Polytechnic University logo.svg` | Fair use |
| `cityu` | `cityu.svg` | `CityU logo.svg` | Public domain |
| `hkbu` | `hkbu.svg` | `Hong Kong Baptist University logo.svg` | Fair use |
| `lingnan` | `lingnan.svg` | `LingnanUniversity logo.svg` | Fair use |
| `eduhk` | `eduhk.svg` | `Logo of The Education University of Hong Kong.svg` | Public domain |

## Rules that still hold

- Never recolour a logo, never crop it, never redraw it.
- A logo is used only to identify the institution it belongs to.
- `cuhk` is a PNG because no SVG of the current CUHK emblem exists on Wikimedia.
  Its manifest path ends `.png` for that reason — the only path in the manifest
  that is not `.svg`.
- Every box falls back to the institution's acronym when a file is missing or
  fails to load, so removing a file degrades rather than breaks.
