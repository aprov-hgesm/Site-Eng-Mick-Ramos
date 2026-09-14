import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Legacy code already uses explicit any in data-mapping/error-handling paths.
      // Keep it visible without turning pre-existing typing debt into a deployment blocker.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      '.next-dev/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
