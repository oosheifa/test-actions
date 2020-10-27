// https://eslint.org/docs/user-guide/configuring
// https://www.npmjs.com/package/@typescript-eslint/parser
/* eslint-disable no-magic-numbers */

const eslintrc = {};

Object.assign(eslintrc, {
  "plugins": [
    "jest"
  ],
  "env": {
    "jest/globals": true,
    "es6": true,
    "node": true
  },
  "extends": [
    // "eslint:all",
    // "plugin:@typescript-eslint/all",
    "eslint:recommended",
  ],
  "ignorePatterns": [
    "dist/**/*.*",
    "dist-*/**/*.*",
    "coverage/**/*.*",
    "src/generated/**/*.*",
  ],
  "parserOptions": {
    "ecmaVersion": 9,
    "sourceType": "module",
  },
  "rules": {
    "space-in-parens": ["error"],
    // "array-bracket-spacing": ["error"],
    // "object-curly-spacing": ["error"],
    "indent": ["error", 2],
    "multiline-comment-style": ["off"],
    "array-element-newline": ["off"],
    "array-bracket-newline": ["off"],
    "comma-dangle": ["off"],
    "sort-keys": ["off"],
  },
  "overrides": [],
});

eslintrc.overrides.push({
  "files": [ "*.ts", "*.tsx" ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    ...eslintrc["plugins"],
    "@typescript-eslint/eslint-plugin"
  ],
  "extends": [
    ...eslintrc["extends"],
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 9,
    "sourceType": "module",
    "ecmaFeatures":  {
      "jsx": true,
    },
    "tsconfigRootDir": ".",
    "project": "./tsconfig.json",
  },
  "rules": {
    ...eslintrc["rules"],
    "@typescript-eslint/interface-name-prefix": ["off"],
  },
});

module.exports = eslintrc;
