/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/src'],

  testMatch: ['**/*.test.ts'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],

  clearMocks: true,

  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],

  collectCoverageFrom: [
    'src/application/**/*.ts',
    'src/domain/**/*.ts',
    '!src/**/*.d.ts',
  ],

  testTimeout: 15000,
};