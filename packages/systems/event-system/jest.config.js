module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 88,
      branches: 80,
      functions: 85,
      lines: 88
    }
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!uuid)',
  ],
};
