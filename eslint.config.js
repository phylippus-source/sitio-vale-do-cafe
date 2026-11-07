import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'dist-debug/**', 'legacy/**', 'golden/**', 'node_modules/**', 'tests/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser } },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none' }],
      'max-len': ['warn', { code: 100, ignoreStrings: true, ignoreComments: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
    },
  },
];
