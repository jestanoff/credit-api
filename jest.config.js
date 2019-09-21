module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['**/src/server/**/*.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['lcov', 'text-summary'],
  modulePaths: ['<rootDir>/src/'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/*.test.js'],
};
