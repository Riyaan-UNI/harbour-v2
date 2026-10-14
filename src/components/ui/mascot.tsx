import type { CSSProperties } from 'react';

/**
 * Mascot — the little sea-creature people in the Harbour directory.
 *
 * Twelve hand-built creatures, one per sample profile, each drawn on a 120×120
 * grid and tinted entirely from tokens so they re-theme with the page. The
 * body is `currentColor` (set per profile from the §3 chart palette); every
 * feature reads `--mascot-ink` as its ink and `--mascot-shine` as its
 * catch-light.
 *
 * Why the ink is its own token and not `--bg`: `--bg` is near-black in dark but
 * NEAR-WHITE in light, and every plate a mascot sits on is light in light mode
 * too — so reading the page background there drew a near-white face on a
 * near-white plate and the eyes, smile and nose disappeared. `--mascot-ink`
 * carries a dark value in BOTH themes (dark mode is byte-identical to the old
 * `--bg`), so the face stays legible on every plate. Highlight shine is the
 * catch-light token, cheeks are gold.
 *
 * Decorative by default (`aria-hidden`, no role): the pfp is a link whose own
 * label names the person, so the mascot never carries meaning on its own —
 * spec §8 Addendum 1 rule 4. Pass `title` to make it an announced image.
 */

export type MascotKind =
  | 'otter'
  | 'octopus'
  | 'turtle'
  | 'jellyfish'
  | 'crab'
  | 'seahorse'
  | 'starfish'
  | 'shrimp'
  | 'seal'
  | 'eel'
  | 'pufferfish'
  | 'whale';

export type MascotProps = {
  kind: MascotKind;
  className?: string;
  style?: CSSProperties;
  /** When set, the mascot is an announced image with this label. */
  title?: string;
};

/* The whole palette is three tokens plus currentColor — no raw colour here. */
const BODY = 'currentColor';
const INK = 'var(--mascot-ink)';
const SHINE = 'var(--mascot-shine)';
const BLUSH = 'var(--gold-text)';

/** Dot eyes with a small specular catchlight. */
function Eyes({
  cy,
  gap = 14,
  r = 7,
}: {
  cy: number;
  gap?: number;
  r?: number;
}): JSX.Element {
  return (
    <g>
      <circle cx={60 - gap} cy={cy} r={r} fill={INK} />
      <circle cx={60 + gap} cy={cy} r={r} fill={INK} />
      <circle cx={60 - gap + r * 0.3} cy={cy - r * 0.4} r={r * 0.34} fill={SHINE} opacity="0.9" />
      <circle cx={60 + gap + r * 0.3} cy={cy - r * 0.4} r={r * 0.34} fill={SHINE} opacity="0.9" />
    </g>
  );
}

function Smile({ cy }: { cy: number }): JSX.Element {
  return (
    <path
      d={`M ${60 - 6} ${cy} Q ${60} ${cy + 7} ${60 + 6} ${cy}`}
      fill="none"
      stroke={INK}
      strokeWidth={3}
      strokeLinecap="round"
    />
  );
}

function Nose({ cy }: { cy: number }): JSX.Element {
  return <ellipse cx={60} cy={cy} rx={4} ry={3} fill={INK} />;
}

function Cheeks({ cy }: { cy: number }): JSX.Element {
  return (
    <g fill={BLUSH} opacity="0.5">
      <ellipse cx={60 - 25} cy={cy} rx={7} ry={4.5} />
      <ellipse cx={60 + 25} cy={cy} rx={7} ry={4.5} />
    </g>
  );
}

/** A river otter — round ears, creamy belly, always holding a warm drink. */
function Otter(): JSX.Element {
  return (
    <g>
      <circle cx="40" cy="34" r="12" fill={BODY} />
      <circle cx="80" cy="34" r="12" fill={BODY} />
      <circle cx="40" cy="36" r="6" fill={INK} opacity="0.35" />
      <circle cx="80" cy="36" r="6" fill={INK} opacity="0.35" />
      <ellipse cx="60" cy="68" rx="40" ry="38" fill={BODY} />
      <ellipse cx="60" cy="82" rx="23" ry="21" fill={INK} opacity="0.2" />
      <ellipse cx="42" cy="101" rx="9" ry="6" fill={BODY} />
      <ellipse cx="78" cy="101" rx="9" ry="6" fill={BODY} />
      <Cheeks cy={76} />
      <Eyes cy={62} r={7} />
      <Nose cy={73} />
      <Smile cy={80} />
    </g>
  );
}

/** An octopus — soft dome, a crown of freckles, eight easy-going arms. */
function Octopus(): JSX.Element {
  return (
    <g>
      <g stroke={BODY} strokeWidth={9} strokeLinecap="round" fill="none">
        <path d="M40 82 q-6 12 2 20 q6 8 -4 14" />
        <path d="M52 86 q-2 14 6 20 q6 6 0 12" />
        <path d="M68 86 q2 14 -6 20 q-6 6 0 12" />
        <path d="M80 82 q6 12 -2 20 q-6 8 4 14" />
      </g>
      <ellipse cx="60" cy="58" rx="36" ry="34" fill={BODY} />
      <g fill={SHINE} opacity="0.5">
        <circle cx="44" cy="46" r="4" />
        <circle cx="76" cy="42" r="5" />
        <circle cx="70" cy="60" r="3" />
        <circle cx="50" cy="62" r="2.5" />
      </g>
      <Cheeks cy={68} />
      <Eyes cy={56} r={7} />
      <Smile cy={69} />
    </g>
  );
}

/** A sea turtle — a plated shell, a curious head, patient flippers. */
function Turtle(): JSX.Element {
  return (
    <g>
      <ellipse cx="26" cy="72" rx="9" ry="7" fill={BODY} />
      <ellipse cx="94" cy="72" rx="9" ry="7" fill={BODY} />
      <ellipse cx="60" cy="70" rx="38" ry="31" fill={BODY} />
      <g stroke={INK} strokeWidth={3} opacity="0.45" fill="none" strokeLinecap="round">
        <path d="M60 42 L60 98" />
        <path d="M24 70 L96 70" />
        <path d="M40 54 L80 86" />
        <path d="M80 54 L40 86" />
      </g>
      <circle cx="60" cy="28" r="15" fill={BODY} />
      <Cheeks cy={34} />
      <Eyes cy={27} gap={8} r={5.5} />
      <Smile cy={37} />
    </g>
  );
}

/** A jellyfish — a glowing bell trailing slow ribbons. */
function Jellyfish(): JSX.Element {
  return (
    <g>
      <g stroke={BODY} strokeWidth={6} strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M42 78 q-4 14 2 24" />
        <path d="M52 82 q-2 16 4 26" />
        <path d="M68 82 q2 16 -4 26" />
        <path d="M78 78 q4 14 -2 24" />
      </g>
      <path d="M28 62 a32 30 0 0 1 64 0 q-8 8 -32 8 q-24 0 -32 -8 Z" fill={BODY} />
      <ellipse cx="52" cy="52" rx="12" ry="9" fill={SHINE} opacity="0.4" />
      <Cheeks cy={56} />
      <Eyes cy={50} r={6.5} />
      <Smile cy={60} />
    </g>
  );
}

/** A crab — a wide shell, two raised claws, six quick little legs. */
function Crab(): JSX.Element {
  return (
    <g>
      <g stroke={BODY} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M40 88 L30 98" />
        <path d="M50 90 L44 102" />
        <path d="M60 91 L60 103" />
        <path d="M70 90 L76 102" />
        <path d="M80 88 L90 98" />
      </g>
      <g stroke={BODY} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M32 62 Q16 52 18 34" />
        <path d="M88 62 Q104 52 102 34" />
      </g>
      <ellipse cx="18" cy="28" rx="12" ry="9" fill={BODY} transform="rotate(-24 18 28)" />
      <ellipse cx="102" cy="28" rx="12" ry="9" fill={BODY} transform="rotate(24 102 28)" />
      <ellipse cx="60" cy="70" rx="36" ry="25" fill={BODY} />
      <Cheeks cy={78} />
      <Eyes cy={62} gap={16} r={7} />
      <Smile cy={78} />
    </g>
  );
}

/** A seahorse — an upright snout, a curled tail, a little dorsal fin. */
function Seahorse(): JSX.Element {
  return (
    <g>
      <path
        d="M60 20 Q34 30 40 62 Q44 84 60 92 Q76 100 78 84 Q79 74 68 76"
        fill="none"
        stroke={BODY}
        strokeWidth={20}
        strokeLinecap="round"
      />
      <path d="M74 46 Q92 52 88 66" fill="none" stroke={BODY} strokeWidth={9} strokeLinecap="round" />
      <ellipse
        cx="52"
        cy="24"
        rx="13"
        ry="11"
        fill={BODY}
        transform="rotate(-18 52 24)"
      />
      <circle cx="40" cy="24" r="5" fill={BODY} />
      <Eyes cy={22} gap={9} r={4.5} />
      <Smile cy={31} />
    </g>
  );
}

/** A starfish — five rounded arms, dimpled with the plate's light. */
function Starfish(): JSX.Element {
  return (
    <g>
      <path
        d="M60 16 L74 50 L110 52 L82 74 L92 108 L60 87 L28 108 L38 74 L10 52 L46 50 Z"
        fill={BODY}
        stroke={BODY}
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <g fill={SHINE} opacity="0.45">
        <circle cx="60" cy="40" r="3.5" />
        <circle cx="44" cy="54" r="3" />
        <circle cx="76" cy="54" r="3" />
        <circle cx="52" cy="80" r="3" />
        <circle cx="68" cy="80" r="3" />
      </g>
      <Cheeks cy={58} />
      <Eyes cy={52} gap={13} r={6} />
      <Smile cy={63} />
    </g>
  );
}

/** A shrimp — a long curled body, a tail fan, whiskers out front. */
function Shrimp(): JSX.Element {
  return (
    <g>
      <path
        d="M76 30 Q98 52 84 78 Q72 100 46 94 Q26 89 30 68"
        fill="none"
        stroke={BODY}
        strokeWidth={26}
        strokeLinecap="round"
      />
      <path d="M30 68 Q34 90 26 100 Q40 102 46 94" fill={BODY} />
      <g stroke={BODY} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M40 44 Q24 34 14 38" />
        <path d="M44 36 Q32 24 22 24" />
      </g>
      <circle cx="44" cy="42" r="15" fill={BODY} />
      <Cheeks cy={48} />
      <Eyes cy={41} gap={8} r={5.5} />
      <Smile cy={50} />
    </g>
  );
}

/** A seal — a smooth barrel, whiskers, a nose right on the snout. */
function Seal(): JSX.Element {
  return (
    <g>
      <path d="M28 96 Q16 106 32 108 Q44 109 36 100 Z" fill={BODY} />
      <path d="M92 96 Q104 106 88 108 Q76 109 84 100 Z" fill={BODY} />
      <ellipse cx="60" cy="76" rx="38" ry="26" fill={BODY} />
      <ellipse cx="60" cy="46" rx="26" ry="24" fill={BODY} />
      <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity="0.55" fill="none">
        <path d="M40 56 Q28 58 22 54" />
        <path d="M40 62 Q28 66 22 64" />
        <path d="M80 56 Q92 58 98 54" />
        <path d="M80 62 Q92 66 98 64" />
      </g>
      <Cheeks cy={50} />
      <Eyes cy={42} gap={12} r={6.5} />
      <Nose cy={53} />
      <Smile cy={59} />
    </g>
  );
}

/** An eel — a long elegant S-curve, a friendly little head. */
function Eel(): JSX.Element {
  return (
    <g>
      <path
        d="M84 104 Q56 100 60 76 Q64 52 40 46 Q22 41 22 30"
        fill="none"
        stroke={BODY}
        strokeWidth={19}
        strokeLinecap="round"
      />
      <circle cx="24" cy="26" r="16" fill={BODY} />
      <Cheeks cy={33} />
      <Eyes cy={25} gap={9} r={5.5} />
      <Smile cy={35} />
    </g>
  );
}

/** A pufferfish — a round little balloon covered in soft spikes. */
function Pufferfish(): JSX.Element {
  return (
    <g>
      <g stroke={INK} strokeWidth={3} strokeLinecap="round" opacity="0.5" fill="none">
        <path d="M60 16 L60 26" />
        <path d="M32 26 L39 34" />
        <path d="M88 26 L81 34" />
        <path d="M18 54 L28 58" />
        <path d="M102 54 L92 58" />
        <path d="M34 92 L40 84" />
        <path d="M86 92 L80 84" />
        <path d="M60 104 L60 96" />
      </g>
      <circle cx="60" cy="62" r="34" fill={BODY} />
      <path d="M92 58 Q108 62 92 72 Z" fill={BODY} />
      <g fill={SHINE} opacity="0.4">
        <circle cx="46" cy="46" r="6" />
        <circle cx="76" cy="80" r="3" />
      </g>
      <Cheeks cy={74} />
      <Eyes cy={58} gap={14} r={7} />
      <Smile cy={76} />
    </g>
  );
}

/** A whale — a big friendly head, a flat fluke, one spout. */
function Whale(): JSX.Element {
  return (
    <g>
      <g stroke={SHINE} strokeWidth={4} strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M50 24 Q46 12 54 8" />
        <path d="M62 24 Q64 14 72 12" />
      </g>
      <path
        d="M36 78 Q28 62 34 44 Q46 30 62 44 Q68 62 60 78 Z"
        fill={BODY}
        transform="translate(0 -6)"
      />
      <ellipse cx="60" cy="74" rx="40" ry="28" fill={BODY} />
      <path d="M22 66 Q8 60 12 76 Q18 84 26 78 Z" fill={BODY} />
      <path d="M60 102 Q38 112 26 104 Q46 102 60 96 Z" fill={BODY} />
      <path d="M60 102 Q82 112 94 104 Q74 102 60 96 Z" fill={BODY} />
      <Cheeks cy={82} />
      <Eyes cy={68} gap={17} r={7} />
      <Smile cy={86} />
    </g>
  );
}

const CREATURES: Record<MascotKind, () => JSX.Element> = {
  otter: Otter,
  octopus: Octopus,
  turtle: Turtle,
  jellyfish: Jellyfish,
  crab: Crab,
  seahorse: Seahorse,
  starfish: Starfish,
  shrimp: Shrimp,
  seal: Seal,
  eel: Eel,
  pufferfish: Pufferfish,
  whale: Whale,
};

export function Mascot({
  kind,
  className,
  style,
  title,
}: MascotProps): JSX.Element {
  const Creature = CREATURES[kind];
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <Creature />
    </svg>
  );
}
