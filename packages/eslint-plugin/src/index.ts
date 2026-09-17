import { noArbitraryStyling } from './rules/no-arbitrary-styling.js';

export const rules = {
  'no-arbitrary-styling': noArbitraryStyling,
};

export const configs = {
  recommended: {
    plugins: {
      get scaffold() {
        return plugin;
      },
    },
    rules: {
      'scaffold/no-arbitrary-styling': 'error',
    },
  },
};

const plugin = {
  meta: {
    name: '@scaffold/eslint-plugin',
    version: '0.1.0',
  },
  rules,
  configs,
};

export default plugin;
