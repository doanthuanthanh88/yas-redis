/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // verbose: true,
  roots: ["src", "test"],
  logHeapUsage: true,
  detectLeaks: true,
  detectOpenHandles: true,
  testTimeout: 60000,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1'
  },
};