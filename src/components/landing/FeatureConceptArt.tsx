export type HarbourFeature = 'scam' | 'settle' | 'cantonese' | 'ask';

type FeatureConceptArtProps = { feature: HarbourFeature };

/** Three original, Harbour-specific story sketches for each tool card. */
export function FeatureConceptArt({ feature }: FeatureConceptArtProps): JSX.Element {
  return (
    <svg
      className={`feature-art feature-art--${feature}`}
      viewBox="0 0 520 210"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="feature-art__backdrop" x="1" y="1" width="518" height="208" rx="25" />

      <g className="feature-art__scene" transform="translate(12 8)">
        <circle className="feature-art__halo" cx="72" cy="88" r="59" />
        <path className="feature-art__ground" d="M16 159 Q70 139 128 159" />
        {feature === 'scam' ? (
          <g className="feature-art__ink">
            <rect className="feature-art__paper" x="39" y="41" width="68" height="91" rx="14" />
            <path className="feature-art__line" d="M51 62h42M51 75h32M51 89h39" />
            <path className="feature-art__alert" d="M65 101h27" />
            <circle className="feature-art__dot" cx="99" cy="111" r="11" />
            <path className="feature-art__line" d="m95 111 3 3 6-7" />
          </g>
        ) : feature === 'settle' ? (
          <g className="feature-art__ink">
            <path className="feature-art__tone-fill" d="M72 37c-19 0-34 15-34 34 0 25 34 58 34 58s34-33 34-58c0-19-15-34-34-34Z" />
            <circle className="feature-art__paper" cx="72" cy="71" r="14" />
            <path className="feature-art__line" d="m65 71 5 5 10-11" />
            <path className="feature-art__ground" d="M54 145h36M63 153h18" />
          </g>
        ) : feature === 'cantonese' ? (
          <g className="feature-art__ink">
            <path className="feature-art__paper" d="M35 50q0-12 12-12h50q12 0 12 12v39q0 12-12 12H67l-17 13v-13h-3q-12 0-12-12Z" />
            <path className="feature-art__line" d="M48 61h43M48 74h28" />
            <circle className="feature-art__dot" cx="98" cy="125" r="7" />
            <path className="feature-art__tone-line" d="M56 132q16-19 32 0t32 0" />
          </g>
        ) : (
          <g className="feature-art__ink">
            <path className="feature-art__paper" d="M36 48q0-12 12-12h49q12 0 12 12v41q0 12-12 12H71l-16 13v-13h-7q-12 0-12-12Z" />
            <circle className="feature-art__tone-fill" cx="70" cy="68" r="15" />
            <path className="feature-art__line" d="M67 64q1-6 7-4 6 3 0 8l-4 4M70 79v1" />
            <path className="feature-art__ground" d="M48 126h50" />
          </g>
        )}
      </g>

      <g className="feature-art__scene" transform="translate(182 8)">
        <circle className="feature-art__halo feature-art__halo--second" cx="72" cy="88" r="59" />
        <path className="feature-art__ground" d="M16 159 Q70 139 128 159" />
        {feature === 'scam' ? (
          <g className="feature-art__ink">
            <circle className="feature-art__paper" cx="67" cy="79" r="31" />
            <path className="feature-art__tone-line" d="M88 102 113 127" />
            <path className="feature-art__alert" d="m67 60 17 31H50Z" />
            <path className="feature-art__line" d="M67 70v10m0 6v1" />
            <circle className="feature-art__dot" cx="112" cy="45" r="6" />
          </g>
        ) : feature === 'settle' ? (
          <g className="feature-art__ink">
            <rect className="feature-art__paper" x="36" y="42" width="76" height="91" rx="14" />
            <path className="feature-art__line" d="M52 62h43m-43 24h43m-43 24h30" />
            <path className="feature-art__tone-line" d="m43 62 4 4 7-8m-11 28 4 4 7-8" />
            <circle className="feature-art__dot" cx="101" cy="116" r="5" />
          </g>
        ) : feature === 'cantonese' ? (
          <g className="feature-art__ink">
            <path className="feature-art__paper" d="M35 47q0-12 12-12h50q12 0 12 12v66q0 12-12 12H47q-12 0-12-12Z" />
            <path className="feature-art__tone-line" d="M50 91V69l17 22V69m10 22V69l17 22V69" />
            <circle className="feature-art__dot" cx="107" cy="47" r="7" />
          </g>
        ) : (
          <g className="feature-art__ink">
            <path className="feature-art__paper" d="M34 47q0-12 12-12h55q12 0 12 12v72q0 12-12 12H46q-12 0-12-12Z" />
            <path className="feature-art__tone-line" d="M49 63h43m-43 13h35m-35 13h39m-39 13h27" />
            <circle className="feature-art__dot" cx="99" cy="119" r="6" />
          </g>
        )}
      </g>

      <g className="feature-art__scene" transform="translate(352 8)">
        <circle className="feature-art__halo feature-art__halo--third" cx="72" cy="88" r="59" />
        <path className="feature-art__ground" d="M16 159 Q70 139 128 159" />
        {feature === 'scam' ? (
          <g className="feature-art__ink">
            <path className="feature-art__tone-fill" d="M72 38 108 52v31c0 28-36 50-36 50S36 111 36 83V52Z" />
            <path className="feature-art__line" d="m55 86 12 12 23-27" />
            <path className="feature-art__ground" d="M106 131h16m-8-8 8 8-8 8" />
          </g>
        ) : feature === 'settle' ? (
          <g className="feature-art__ink">
            <circle className="feature-art__paper" cx="72" cy="83" r="43" />
            <circle className="feature-art__tone-fill" cx="72" cy="83" r="30" />
            <path className="feature-art__line" d="M72 60v23l18 12" />
            <path className="feature-art__ground" d="M47 139h50" />
            <circle className="feature-art__dot" cx="108" cy="47" r="7" />
          </g>
        ) : feature === 'cantonese' ? (
          <g className="feature-art__ink">
            <path className="feature-art__paper" d="M35 75q0-12 12-12h49q12 0 12 12v27q0 12-12 12H65l-18 13v-13h0q-12 0-12-12Z" />
            <path className="feature-art__tone-line" d="M48 91q6-17 12 0t12 0 12 0 12 0" />
            <path className="feature-art__line" d="M52 47q20-18 40 0" />
            <circle className="feature-art__dot" cx="45" cy="49" r="5" />
          </g>
        ) : (
          <g className="feature-art__ink">
            <circle className="feature-art__paper" cx="71" cy="83" r="41" />
            <path className="feature-art__tone-line" d="M47 83h46m-12-12 12 12-12 12" />
            <circle className="feature-art__dot" cx="106" cy="46" r="7" />
            <path className="feature-art__ground" d="M47 140h51" />
          </g>
        )}
      </g>
    </svg>
  );
}
