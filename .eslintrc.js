/*! m0-start */
const config = {
    extends: ['airbnb-base', 'prettier', 'plugin:jest/recommended'],
    env: {
        node: true
    },
    // overwrite airbnb-base to use commonjs instead of ES6 modules
    parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true
        }
    },
    rules: {
        'prettier/prettier': ['error'],
        'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
        curly: ['error', 'all'],
        'jest/expect-expect': ['error'],
        'no-param-reassign': ['error', {props: false}]
    },
    plugins: ['prettier']
};
/*! m0-end */

/*! m0-start */
module.exports = config;
/*! m0-end */
