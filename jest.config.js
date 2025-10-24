/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/extension/icons/"],
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "extension/**/*.js",
    "cli/**/*.js",
    "!extension/background.js",
    "!extension/content.js",
    "!extension/popup.js"
  ],
  coverageReporters: ["text", "lcov"],
};
