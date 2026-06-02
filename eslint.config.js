import antfu from '@antfu/eslint-config';
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' };

const autoImportGlobals = Object.fromEntries(
  Object.entries(autoImport.globals).map(([name, writable]) => [
    name,
    writable ? 'writable' : 'readonly',
  ]),
);

export default antfu(
  {
    vue: true,
    typescript: true,
    unocss: true,
    gitignore: true,
    lessOpinionated: true,
    stylistic: {
      semi: true,
    },
  },
  {
    languageOptions: {
      globals: autoImportGlobals,
    },
    rules: {
      // Keep this migration behavior-compatible with the previous Antfu 0.41 baseline.
      'antfu/consistent-chaining': 'off',
      'antfu/consistent-list-newline': 'off',
      curly: ['error', 'all'],
      'e18e/prefer-array-some': 'off',
      'e18e/prefer-date-now': 'off',
      'e18e/prefer-regex-test': 'off',
      'import/consistent-type-specifier-style': 'off',
      'import/newline-after-import': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'regexp/no-dupe-characters-character-class': 'off',
      'regexp/no-empty-alternative': 'off',
      'regexp/no-obscure-range': 'off',
      'regexp/no-potentially-useless-backreference': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'regexp/no-useless-escape': 'off',
      'regexp/prefer-d': 'off',
      'regexp/prefer-range': 'off',
      'regexp/strict': 'off',
      'regexp/use-ignore-case': 'off',
      'style/eol-last': 'off',
      'style/indent': 'off',
      'style/indent-binary-ops': 'off',
      'style/jsx-curly-brace-presence': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'style/member-delimiter-style': 'off',
      'style/no-multi-spaces': 'off',
      'style/no-trailing-spaces': 'off',
      'style/object-curly-spacing': 'off',
      'style/operator-linebreak': 'off',
      'style/semi-spacing': 'off',
      'style/type-generic-spacing': 'off',
      'test/consistent-test-it': 'off',
      'test/prefer-lowercase-title': 'off',
      'ts/no-use-before-define': ['error', { allowNamedExports: true, functions: false }],
      'unicorn/prefer-dom-node-text-content': 'off',
      'unused-imports/no-unused-vars': 'off',
      'vue/no-empty-component-block': ['error'],
      'vue/no-required-prop-with-default': 'off',
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@vueuse/core',
          importNames: ['useClipboard'],
          message: 'Please use local useCopy from src/composable/copy.ts instead of useClipboard.',
        }],
      }],
    },
  },
);
