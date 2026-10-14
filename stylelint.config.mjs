/**
 * Harbour Stylelint config — spec §12.
 *
 * Three rules carry the weight:
 *   1. No `px` anywhere except 1px hairlines (builder rule 2).
 *   2. No raw hex, rgb or hsl outside tokens.css (builder rule 1).
 *   3. Spacing declarations may only use the spacing scale, the two layout
 *      tokens the spec names, or a keyword (spec §6, added in Part A2).
 *
 * Everything else is stylelint-config-standard, with the handful of rules that
 * fight Tailwind v4's CSS-first syntax or the spec's mandated legacy notation
 * switched off deliberately.
 */

/** Any px measurement that is not exactly `1px`. */
const OFF_SCALE_PX = /(?:\d*\.\d+|\d{2,}|[02-9])px/;

/**
 * The property families the spacing scale owns: padding, margin, gap and
 * inset. `row-gap` / `column-gap` are named explicitly because they do not
 * start with `gap`; `top` / `right` / `bottom` / `left` are the physical
 * longhands of `inset`.
 *
 * Deliberately NOT included: `scroll-margin-*` and `scroll-padding-*`. Those
 * are scroll-snap offsets, not layout spacing — a sticky nav's scroll-margin
 * is a distance the *scroll container* reserves, not a gap in the design.
 * Custom properties (`--section-padding-block`) are also untouched, because
 * they begin with `--` and never match this pattern.
 */
const SPACING_PROPERTIES =
  '/^(?:padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)(?:-[a-z-]+)?$/';

/**
 * One permitted value in a spacing declaration:
 *   - a step of the spec's ten-value scale (`var(--space-1..10)`),
 *   - the section and container tokens the spec names in §6,
 *   - the two hero offsets (§6, added with the under-nav hero): the pull-up and
 *     the compensating top padding. Both are `calc()` composites of the tokens
 *     above, kept in tokens.css precisely so they are declared once rather than
 *     written per-component,
 *   - the dashboard rail's sticky offset (§4.6, `docs/DASHBOARD_DESIGN_SPEC.md`):
 *     `--dash-rail-top` is `calc(var(--nav-height) + var(--space-6))`, a
 *     composite of the same tokens, declared in tokens.css and consumed by the
 *     rail's `inset-block-start` — the one place the spec writes the calc into
 *     an `inset-*` declaration,
 *   - the aurora blob corner offsets, which are *positions* in %, not spacing
 *     steps, and live in tokens.css like every other value,
 *   - the `/app/people` scene drifter offsets (`--drifter-pull-*`), which are
 *     deliberate negative pulls that seat a floating mascot against the page
 *     edge. They are offsets *within* a step of the scale (`calc(var(--space-6)
 *     * -1)`), declared once in tokens.css rather than written per-rule,
 *   - the keywords `0` and `auto`.
 */
const SPACING_VALUE =
  '(?:var\\(--space-\\d+\\)|var\\(--section-padding-block\\)|var\\(--container-padding-inline\\)|var\\(--hero-pull-up\\)|var\\(--hero-padding-block-start\\)|var\\(--dash-rail-top\\)|var\\(--aurora-blob-[a-z0-9-]+\\)|var\\(--drifter-[a-z0-9-]+\\)|0|auto)';

/**
 * Flags a spacing value that is NOT a whitespace-separated run of permitted
 * values — so `padding: var(--space-2) var(--space-4)` passes, and
 * `padding: 1rem`, `gap: 12px` and `margin-inline: 3%` do not.
 */
const OFF_SCALE_SPACING = new RegExp(
  `^(?!${SPACING_VALUE}(?:\\s+${SPACING_VALUE})*$)`,
);

export default {
  extends: ['stylelint-config-standard'],

  /* The legacy lane's three stylesheets are copied verbatim from the old build
     and are deliberately not held to this repo's rules — they carry px values,
     raw colours and a namespacing convention that predate the spec. Stylelint's
     CLI call in package.json globs `src/**\/*.css`, so this ignorePatterns
     entry is what keeps them out of the gate. New CSS never lives here. */
  ignoreFiles: ['src/legacy/**/*.css'],

  rules: {
    /* --- Builder rule 1: tokens only ---------------------------------- */
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],

    /* --- Builder rule 2: px only for 1px hairlines --------------------- */
    'declaration-property-value-disallowed-list': {
      '/.*/': [OFF_SCALE_PX],

      /* --- Spec §6: the spacing scale, and nothing else ---------------- */
      [SPACING_PROPERTIES]: [OFF_SCALE_SPACING],
    },

    /* The spec's colour table is written in legacy rgba() with decimal alpha,
       so notation rules must not rewrite tokens.css. Raw colour functions are
       banned everywhere else, so these rules have nothing left to police. */
    'color-function-notation': null,
    'alpha-value-notation': null,

    /* Tailwind v4 CSS-first at-rules. */
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'custom-variant',
          'utility',
          'variant',
          'apply',
          'source',
          'plugin',
          'reference',
          'config',
        ],
      },
    ],
    'import-notation': 'string',

    /* Vendor prefixes the spec explicitly requires, plus their modern form.
       Both spellings are listed: the rule matches against the property name as
       written, so the prefixed form is what actually needs to be allowed. */
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: [
          '-webkit-backdrop-filter',
          '-webkit-mask-image',
          '-webkit-text-size-adjust',
          'backdrop-filter',
          'mask-image',
          'text-size-adjust',
        ],
      },
    ],

    /* View Transitions pseudo-elements are newer than stylelint's list. */
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: [
          'view-transition',
          'view-transition-group',
          'view-transition-image-pair',
          'view-transition-old',
          'view-transition-new',
        ],
      },
    ],

    /* BEM-ish names for the aurora internals; everything else is kebab-case. */
    'selector-class-pattern':
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/,

    /* tokens.css is a deliberately dense declaration list, one per token. */
    'custom-property-empty-line-before': null,
  },

  overrides: [
    {
      /* The one file allowed to hold raw colour values — and it reproduces the
         spec's colour table exactly, so notation rules must not rewrite it. */
      files: ['**/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
        'color-function-alias-notation': null,
        'color-hex-length': null,
      },
    },
  ],
};
