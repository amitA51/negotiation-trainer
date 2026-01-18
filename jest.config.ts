import type { Config } from 'jest'

const config: Config = {
  displayName: 'NEGO Tests',
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/coverage/',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/types/**',
  ],
  
  // Coverage thresholds - will increase as test coverage improves
  coverageThreshold: {
    global: {
      branches: 8,
      functions: 5,
      lines: 8,
      statements: 8,
    },
  },
  
  // Transform files with SWC (faster than ts-jest)
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Clear mocks automatically
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Max workers for parallel execution
  maxWorkers: '50%',
}

export default config
