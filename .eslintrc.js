module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
  },

  parser: 'vue-eslint-parser',

  parserOptions: {},

  extends: ['plugin:nuxt/recommended', 'prettier'],

  plugins: [],

  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['warn', 'error'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'dot-notation': 'off',
  },
};
