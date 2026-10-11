/**
 * Harbour ESLint rule: no Tailwind arbitrary values.
 *
 * Builder rule 1 says tokens only, so `w-[437px]`, `bg-[#fff]` and
 * `grid-cols-[1fr_2fr]` must not appear. There is no Tailwind v4-compatible
 * plugin that does this, so the check is implemented here.
 *
 * Arbitrary *variants* are deliberately allowed — `data-[state=open]:bg-accent`
 * and `[&>svg]:size-4` are legitimate Tailwind, and the spec only asks to flag
 * arbitrary values such as `w-[437px]`.
 *
 * If a value genuinely has to be arbitrary, disable the rule inline on that
 * line with a reason.
 */

const ARBITRARY_VALUE = /\[[^\]]*\]/;

const CLASS_ATTRIBUTES = new Set(['className', 'class']);
const CLASS_HELPERS = new Set(['cn', 'clsx', 'twMerge', 'cva']);

/** Strips leading variants (`md:`, `data-[x]:`, `[&>svg]:`) from a class token. */
function baseUtility(token) {
  const segments = token.split(':');
  return segments[segments.length - 1] ?? token;
}

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
        if (ARBITRARY_VALUE.test(baseUtility(token))) {
          context.report({
            node,
            messageId: 'arbitrary',
            data: { token },
          });
        }
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
  },
};

export default noTailwindArbitraryValues;
