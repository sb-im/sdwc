module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/base',
    'plugin:vue/essential'
  ],
  rules: {
    'require-atomic-updates': 'off',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  }
}
