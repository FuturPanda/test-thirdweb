const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;


/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  "moduleDirectories": [
        "node_modules",
        "src"
      ],
      "moduleFileExtensions": [
        "js",
        "json",
        "ts"
      ],
      "roots": [
        "src"
      ],
      "testRegex": ".spec.ts$",
      "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
      },
      "coverageDirectory": "../coverage",
      "testEnvironment": "node",
      "moduleNameMapper": {
        "src/(.*)": "<rootDir>/src/$1"
      }
};
