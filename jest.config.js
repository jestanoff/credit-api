module.exports = {
  // automock: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePaths: ['<rootDir>/src/'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/*.test.js'],
};
