import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/.codegraph/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
];
