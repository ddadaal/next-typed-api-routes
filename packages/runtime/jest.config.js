// jest.config.js
const { pathsToModuleNameMapper } = require("ts-jest");
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require("./tsconfig");

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: ".",
  preset: "ts-jest",
  moduleNameMapper: compilerOptions.paths ? pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }) : undefined,
  testMatch: [
    "<rootDir>/tests/**/*.test.ts?(x)",
  ],
  coverageDirectory: `coverage`,
  testTimeout: 30000,
  coverageReporters: ["lcov"],
  setupFilesAfterEnv: ["jest-extended/all"],
};
