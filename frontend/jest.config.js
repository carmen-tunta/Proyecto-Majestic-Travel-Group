module.exports = {
  testMatch: [
    "<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}",
    "<rootDir>/test/**/*.(test|spec).{js,jsx,ts,tsx}"
  ],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
};
