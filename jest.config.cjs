/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
}
