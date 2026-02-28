/**
 * Hospitality Booking Engine - Vitest Configuration
 * 
 * Test configuration for unit and integration tests.
 * 
 * @author webwakaagent5
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'services/**/*.ts',
        'adapters/**/*.ts',
        'events/**/*.ts',
        'api/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/__tests__/**',
        'ui/**/*', // UI tests handled separately
      ],
      all: true,
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
    include: ['__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: [],
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
