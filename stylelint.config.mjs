/**
 * Harbour Stylelint config — spec §12.
 *
 * Two rules carry the weight:
 *   1. No `px` anywhere except 1px hairlines (builder rule 2).
 *   2. No raw hex, rgb or hsl outside tokens.css (builder rule 1).
 *
 * Everything else is stylelint-config-standard, with the handful of rules that
 * fight Tailwind v4's CSS-first syntax or the spec's mandated legacy notation
 * switched off deliberately.
 */

/** Any px measurement that is not exactly `1px`. */
const OFF_SCALE_PX = /(?:\d*\.\d+|\d{2,}|[02-9])px/;

export default {
  extends: ['stylelint-config-standard'],

  rules: {
    /* --- Builder rule 1: tokens only ---------------------------------- */
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],

    /* --- Builder rule 2: px only for 1px hairlines --------------------- */
    'declaration-property-value-disallowed-list': {
      '/.*/': [OFF_SCALE_PX],
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
