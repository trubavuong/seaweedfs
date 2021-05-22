module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['error', 'stroustrup'],
    'object-curly-newline': ['error', {
      multiline: true,
      consistent: true,
      minProperties: 4,
    }],
  },
};
