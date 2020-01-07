module.exports = {
  parserOptions: {
    ecmaVersion: 2020
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/base',
    'plugin:vue/essential'
  ],
  rules: {
    'require-atomic-updates': 'off',
    'no-console': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  },
  globals: {
    __SDWC__VERSION__: 'readonly',
    __SDWC_DEV__: 'readonly'
  }
}
