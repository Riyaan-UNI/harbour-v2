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
      'playwright-report/**',
      'test-results/**',
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
        { allowConstantExport: true },
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
