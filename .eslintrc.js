module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'max-len': ['error', {code: 140}],
    'object-curly-spacing': 0,
    'object-shorthand': 0,
    'prefer-const': 0,
    'brace-style': [2, 'stroustrup'],
    'indent': [1 /* warning */, 4],
    'arrow-body-style': ['error', 'always'],
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'eqeqeq': 0,
    'space-before-function-paren': 0,
    'func-names': 0,
    'newline-per-chained-call': 0,
    'operator-linebreak': [2, 'after'],
    'prefer-destructuring': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
