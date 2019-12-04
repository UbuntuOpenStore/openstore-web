module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/essential',
        '@vue/airbnb',
        'eslint-config-bhdouglass',
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

        'max-len': ['error', {code: 160}],
        'no-continue': 'off',
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
