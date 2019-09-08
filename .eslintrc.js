module.exports = {
  env: {
    commonjs: false,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'arrow-parens': 0, 
    'import/extensions': 0,
    'no-console': 0,
  },
};
