module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/src/analytics-reporting/__tests__/**/*.test.ts',"**/transportation/primitives/__tests__/**/*.ts", "**/transport-company/__tests__/**/*.ts", "**/motor-park/__tests__/**/*.ts", "**/sales/__tests__/**/*.ts", "**/inventory-sync/__tests__/**/*.ts", "**/headless-cms/__tests__/**/*.ts", "**/no-code-builder/__tests__/**/*.ts", "**/payment-billing/__tests__/**/*.ts", "**/user-identity/__tests__/**/*.ts", "**/search-discovery/__tests__/**/*.ts", "**/sites-funnels-website-builder/__tests__/**/*.ts", "**/sites-funnels-landing-page-builder/__tests__/**/*.ts", "**/sites-funnels-form-builder/__tests__/**/*.ts", "**/sites-funnels-email-campaign-builder/__tests__/**/*.ts", "**/campaign-management/tests/**/*.ts", "**/fundraising-module/tests/**/*.ts", "**/polling-results/tests/**/*.ts", "**/constituency-management/tests/**/*.ts"],
  collectCoverageFrom: [
    'src/transportation/primitives/**/*.ts',
    'src/headless-cms/**/*.ts',
    'src/sites-funnels-website-builder/**/*.ts',
    'src/sites-funnels-landing-page-builder/**/*.ts',
    'src/sites-funnels-form-builder/**/*.ts',
    'src/sites-funnels-email-campaign-builder/**/*.ts',
    'src/campaign-management/**/*.ts',
    'src/fundraising-module/**/*.ts',
    'src/polling-results/**/*.ts',
    'src/constituency-management/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coverageDirectory: 'coverage',
  verbose: true
};
