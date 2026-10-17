import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'backend-unit',
          include: ['src/tests/unit/backend/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/*.test.*', '**/tests/**'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
