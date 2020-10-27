module.exports = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
  ],
};

