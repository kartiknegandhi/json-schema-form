module.exports = {
  // this is required as a preset
  moduleDirectories: ["src", "node_modules"],
  setupFilesAfterEnv: ["./setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/example/"],
  transform: {
    "^.+\\.(js|jsx|tsx)$": "babel-jest",
    "^.+\\.(ts)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "!<rootDir>/node_modules/@here/hds-react-components",
  ],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/mocks/fileMock.js",
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};
