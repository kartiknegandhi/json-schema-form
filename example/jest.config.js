module.exports = {
  // this is required as a preset
  preset: "ts-jest/presets/js-with-ts",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  collectCoverage: true,
  coverageReporters: ["lcov"],
  moduleDirectories: ["src", "node_modules"],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
    },
  },
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coverageDirectory: "coverage",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/cypress/"],
  testMatch: ["<rootDir>/src/*.{spec,test}.{js,jsx,ts,tsx}"],
  transform: {
    "^.+\\.(js|jsx|ts)$": "babel-jest", // ts-jest wont work here, babel-jest:^26.6.0 works with jest:26.6.0 well, for demo have manually added babel-jest in react-script its already included,no need to add externally
  },
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.svg": "<rootDir>/fileTransformer.ts",
    "@here/hds-launcher":
      "<rootDir>/node_modules/@here/hds-launcher/build/hds-launcher.js",
  },
  transformIgnorePatterns: [
    "^.+\\.module\\.(css|sass|scss)$",
    "!<rootDir>/node_modules/@here/hds-react-components",
  ],
  verbose: false,
};
