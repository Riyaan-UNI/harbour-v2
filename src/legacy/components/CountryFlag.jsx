import { flagSrc } from "../lib/flags.js";

/**
 * A country's flag, or its two-letter code when no flag file exists.
 *
 * Both branches are decorative — the country name is always rendered as text
 * next to this — so neither carries a label. The code tile is what the picker
 * showed before flags existed, and it is still what the "Another region /
 * prefer not to say" row shows, since that row has no country behind it.
 *
 * `loading="lazy"` matters: the country dialog renders all 251 rows at once and
 * only about a dozen are on screen.
 */
export default function CountryFlag({ code, className = "" }) {
  const src = flagSrc(code);
  const classes = className ? ` ${className}` : "";

  if (!src) {
    return (
      <span className={`country-flag-code${classes}`} aria-hidden="true">
        {code === "OTHER" ? "···" : code || "＋"}
      </span>
    );
  }

  return (
    <img
      className={`country-flag${classes}`}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}
