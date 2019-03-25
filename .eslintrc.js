module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/base',
    'plugin:vue/essential',
    // 'plugin:vue/strongly-recommended',
    //'plugin:vue/recommended'
  ],
  rules: {
    'no-undef': 'off',
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/html-indent': 'warn',
    'vue/require-v-for-key':'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off'
  }
}
