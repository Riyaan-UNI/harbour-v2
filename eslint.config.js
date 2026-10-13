import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import noTailwindArbitraryValues, {
  noOffScaleSpacing,
} from './eslint-rules/no-tailwind-arbitrary-values.mjs';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'server/**',
      'playwright-report/**',
      'test-results/**',
      // The old build is read-only reference material, not our source: it is
      // plain JSX that predates this repo's rules, and the gate would fail on
      // 2,550 pre-existing findings instead of on anything we wrote.
      'Harbour-oldbuild/**',
      // The ported legacy lane. Same reasoning: it is working JSX carried over
      // from the old build, and the harbour/* rules and the TS-strict rules are
      // for new code only. The `files` blocks below already scope to
      // `src/**/*.{ts,tsx}`, so this entry is what keeps the vendored JSX out.
      'src/legacy/**',
    ],
  },

  ...tseslint.configs.recommended,

  // Application source.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      harbour: {
        rules: {
          'no-tailwind-arbitrary-values': noTailwindArbitraryValues,
          'no-off-scale-spacing': noOffScaleSpacing,
        },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Builder rule 1: tokens only. Spec §12 asks for this check by name.
      'harbour/no-tailwind-arbitrary-values': 'error',
      // Spec §6's spacing scale is ten values, not Tailwind's numeric scale.
      'harbour/no-off-scale-spacing': 'error',
    },
  },

  // Fast-refresh only makes sense for files that export components.
  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          // Two factories build components without the rule being able to see
          // it: the layout primitives (`createPolymorphicComponent`) and the
          // lucide icon wrapper (`createIcon`). Without naming them here, every
          // export they produce is reported as a non-component export.
          extraHOCs: ['createPolymorphicComponent', 'createIcon'],
        },
      ],
    },
  },

  // Config files, build scripts and end-to-end tests run on Node.
  {
    files: [
      '*.config.{js,mjs,ts}',
      'eslint-rules/**/*.mjs',
      'scripts/**/*.mjs',
      'e2e/**/*.ts',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
);
