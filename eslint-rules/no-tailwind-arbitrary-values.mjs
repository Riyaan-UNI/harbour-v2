/**
 * Harbour ESLint rules for Tailwind class tokens.
 *
 * Two rules live here because they share the same machinery — finding string
 * literals that sit in a class position, splitting them into class tokens, and
 * peeling the variants off each one.
 *
 *   1. no-tailwind-arbitrary-values — builder rule 1. `w-[437px]`, `bg-[#fff]`
 *      and `grid-cols-[1fr_2fr]` must not appear. Arbitrary *variants* are
 *      deliberately allowed: `data-[state=open]:bg-accent` and `[&>svg]:size-4`
 *      are legitimate Tailwind, and the spec only asks to flag arbitrary values.
 *
 *   2. no-off-scale-spacing — the trap the review found. Tailwind's step
 *      numbers are NOT the spec's names. Spec `space-5` is 1.5rem, which is
 *      Tailwind `p-6`, not `p-5`. So `p-5` silently means 1.25rem — a value the
 *      spec forbids. This rule allows only the steps that resolve to one of the
 *      spec's ten spacing values, in p*, m*, gap* and space-* utilities.
 *
 * Both rules are proved against deliberate failing samples; see
 * docs/PROGRESS.md for the observed output.
 */

const ARBITRARY_VALUE = /\[[^\]]*\]/;

const CLASS_ATTRIBUTES = new Set(['className', 'class']);
const CLASS_HELPERS = new Set(['cn', 'clsx', 'twMerge', 'cva']);

/** Strips leading variants (`md:`, `data-[x]:`, `[&>svg]:`) from a class token. */
function baseUtility(token) {
  const segments = token.split(':');
  return segments[segments.length - 1] ?? token;
}

/* -------------------------------------------------------------------------- */
/* Shared visitor                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Builds the node visitors both rules need: every string literal (and every
 * template quasi) that appears in a class position, tokenised and handed to
 * `onToken`.
 *
 * `onToken(token, base, node)` — `token` is the raw class token including any
 * variants, `base` is the utility with the variants stripped.
 */
function classTokenVisitors(context, onToken) {
  const sourceCode = context.sourceCode;

  function isInClassContext(node) {
    for (const ancestor of sourceCode.getAncestors(node)) {
      if (
        ancestor.type === 'JSXAttribute' &&
        ancestor.name.type === 'JSXIdentifier' &&
        CLASS_ATTRIBUTES.has(ancestor.name.name)
      ) {
        return true;
      }
      if (
        ancestor.type === 'CallExpression' &&
        ancestor.callee.type === 'Identifier' &&
        CLASS_HELPERS.has(ancestor.callee.name)
      ) {
        return true;
      }
    }
    return false;
  }

  function scan(node, raw) {
    if (typeof raw !== 'string') return;
    for (const token of raw.split(/\s+/)) {
      if (!token) continue;
      onToken(token, baseUtility(token), node);
    }
  }

  return {
    Literal(node) {
      if (typeof node.value !== 'string') return;
      if (!isInClassContext(node)) return;
      scan(node, node.value);
    },
    TemplateLiteral(node) {
      if (!isInClassContext(node)) return;
      for (const quasi of node.quasis) {
        scan(node, quasi.value.cooked ?? quasi.value.raw);
      }
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Rule 1 — arbitrary values                                                   */
/* -------------------------------------------------------------------------- */

/** @type {import('eslint').Rule.RuleModule} */
const noTailwindArbitraryValues = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Tailwind arbitrary values such as w-[437px]; use a design token instead.',
    },
    messages: {
      arbitrary:
        'Arbitrary Tailwind value "{{token}}". Use a token from docs/DESIGN_SPEC.md, or disable this rule inline with a reason.',
    },
    schema: [],
  },

  create(context) {
    return classTokenVisitors(context, (token, base, node) => {
      if (!ARBITRARY_VALUE.test(base)) return;
      context.report({ node, messageId: 'arbitrary', data: { token } });
    });
  },
};

/* -------------------------------------------------------------------------- */
/* Rule 2 — off-scale spacing                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The spacing utilities the rule polices. Ordered longest-prefix-first so the
 * alternation cannot match `p` where `px` was meant.
 */
const SPACING_UTILITY =
  /^-?(?:space-x|space-y|gap-x|gap-y|mx|my|mt|mb|ms|me|px|py|pt|pb|ps|pe|gap|p|m)-(.+)$/;

/**
 * The only steps allowed. The ten numeric values are the Tailwind steps that
 * resolve to one of the spec's ten spacing values:
 *
 *   spec space-1..10 = 0.25 0.5 0.75 1 1.5 2 3 4 6 8 rem
 *   Tailwind step    = 1    2   3    4 6   8 12 16 24 32
 *
 * `0`, `px`, `auto` and `reverse` are keywords, not steps, and are allowed
 * because they are not measurements at all (`m-auto` centres, `space-x-reverse`
 * flips an axis).
 */
const ALLOWED_STEPS = new Set([
  '0',
  'px',
  'auto',
  'reverse',
  '1',
  '2',
  '3',
  '4',
  '6',
  '8',
  '12',
  '16',
  '24',
  '32',
]);

/** @type {import('eslint').Rule.RuleModule} */
const noOffScaleSpacing = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow off-scale Tailwind spacing steps (p-5, gap-7, mt-10). Tailwind step numbers are not the design spec names.',
    },
    messages: {
      offScale:
        'Off-scale spacing "{{token}}". Tailwind step numbers are not the spec names — spec space-5 is Tailwind "6". Allowed steps: 0, px, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32 (plus auto). See the mapping table in docs/DESIGN_SPEC.md section 6.',
    },
    schema: [],
  },

  create(context) {
    return classTokenVisitors(context, (token, base, node) => {
      // Rule 1 owns arbitrary values; do not double-report them.
      if (ARBITRARY_VALUE.test(base)) return;

      const match = SPACING_UTILITY.exec(base);
      if (!match) return;

      const step = match[1];
      if (ALLOWED_STEPS.has(step)) return;

      context.report({ node, messageId: 'offScale', data: { token } });
    });
  },
};

export default noTailwindArbitraryValues;
export { noOffScaleSpacing };
