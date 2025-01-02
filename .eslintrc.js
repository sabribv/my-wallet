module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@angular-eslint',
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'plugin:@angular-eslint/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',  // Esta línea es importante
  ],
  rules: {
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case',
      },
    ],
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        // Aquí puedes personalizar tu configuración de Prettier
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        tabWidth: 2,
        printWidth: 80,
        endOfLine: 'auto',  // Esto resuelve los problemas con los saltos de línea
      },
    ],
  },
};
