module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
  },

  parser: 'vue-eslint-parser',

  parserOptions: {},

  // extends: ['@nuxtjs', 'plugin:prettier/recommended', 'plugin:nuxt/recommended'],
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],

  plugins: [],

  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['warn', 'error'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'dot-notation': 'off',
  },
};
