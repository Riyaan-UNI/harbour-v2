/**
 * The eight UGC-funded universities, as the legacy lane needs them.
 *
 * This is the legacy-lane view of the v2 manifest in
 * `src/components/ui/university-logos.ts`: same eight institutions, same order,
 * same ids. The ids are what `UniversityLogo` resolves a bundled logo file
 * against, so they must stay in step with that manifest.
 *
 * `short` is the acronym the old picker showed and the profile still stores the
 * full `name` — both are kept so a stored profile written before logos existed
 * still matches by name.
 *
 * The old `color` and `monogram` fields are gone. They existed only to draw the
 * letter tiles that the real logos now replace, and `monogram: true` on CUHK and
 * HKBU would now read as "this one has no logo" when it does.
 */
export const hkUniversities = [
  { id: "hku", name: "The University of Hong Kong", short: "HKU", domain: "hku.hk" },
  { id: "cuhk", name: "The Chinese University of Hong Kong", short: "CUHK", domain: "cuhk.edu.hk" },
  { id: "hkust", name: "The Hong Kong University of Science and Technology", short: "HKUST", domain: "hkust.edu.hk" },
  { id: "polyu", name: "The Hong Kong Polytechnic University", short: "PolyU", domain: "polyu.edu.hk" },
  { id: "cityu", name: "City University of Hong Kong", short: "CityU", domain: "cityu.edu.hk" },
  { id: "hkbu", name: "Hong Kong Baptist University", short: "HKBU", domain: "hkbu.edu.hk" },
  { id: "lingnan", name: "Lingnan University", short: "LU", domain: "ln.edu.hk" },
  { id: "eduhk", name: "The Education University of Hong Kong", short: "EdUHK", domain: "eduhk.hk" },
];

/**
 * The manifest entry for a stored `university` value.
 *
 * A profile stores the full name, but the logo is keyed by id, so the login
 * picker needs this lookup. Two values are not names and resolve to `null`:
 * the empty string, and the picker's "Other / not enrolled yet" option.
 */
export function universityByName(value) {
  if (!value) return null;
  return hkUniversities.find(item => item.name === value) || null;
}
