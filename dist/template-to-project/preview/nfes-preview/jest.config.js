var path = require("path");
const babelJest = require("babel-jest");
var curFolder = path.join(__dirname, "__tests__");

module.exports = {
  testMatch: ["**/__tests__/**/*.(test|spec).(t|j)s?(x)"],
  collectCoverageFrom: ["pages/**/*.{js,jsx,ts,tsx}"],
  testURL: "http://localhost",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": curFolder + "/mocks/styleMock.js",
    "^csr!@ctrip/bbz-react-canvas": curFolder + "/mocks/moduleMock.js",
    "@ctrip/bbz_utils": curFolder + "/mocks/moduleMock.js",
    "lodash-es": "lodash",
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
    "\\.scss",
  ],
};
