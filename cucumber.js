const common = {
  paths: ['features/**/*.feature'],
  requireModule: ['ts-node/register'],
  require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  format: [
    'allure-cucumberjs/reporter:reports/allure-cucumber.log',
    'summary',
    'progress-bar',
  ],
  formatOptions: {
    resultsDir: 'reports/allure-results',
  },
};

module.exports = {
  default: {
    ...common,
    tags: 'not @requires-stock',
  },
  api: {
    ...common,
    tags: '@api',
  },
  ui: {
    ...common,
    tags: '@ui and not @requires-stock',
  },
  'ui:stock': {
    ...common,
    tags: '@ui and @requires-stock',
  },
};
