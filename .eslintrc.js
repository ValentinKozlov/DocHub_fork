module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },
  globals: {
    DocHub: true,
    vscode: 'readonly',
    Zopfli: 'readonly'
  },
  ignorePatterns: ['**/public/libs/*.js', '**/libs/*.js'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 10,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'plugin:vue/base',
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
        'no-tabs': 0
      }
    }
  ],
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        args: 'none'
      }
    ],
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 0,
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'no-console': 'warn',
    'no-debugger': 'warn',
    quotes: ['warn', 'single'],
    'quote-props': 'off',
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'vue/no-v-html': 'off',
    'vue/no-mutating-props': 'off',
    'vue/arrow-spacing': 'error',
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        registeredComponentsOnly: false
      }
    ],
    'vue/eqeqeq': 'error',
    'vue/html-closing-bracket-newline': [
      'error',
      {
        multiline: 'never',
        singleline: 'never'
      }
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        multiline: {
          allowFirstLine: false,
          max: 1
        },
        singleline: 8
      }
    ],
    'vue/match-component-file-name': 'error',
    'vue/no-unused-components': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/script-indent': [
      'error',
      2,
      {
        baseIndent: 1,
        switchCase: 1
      }
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/v-bind-style': ['error', 'longform'],
    'vue/v-on-style': ['error', 'longform'],
    'vue/html-indent': ['error', 2, {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: []
    }]
  }
}; 
