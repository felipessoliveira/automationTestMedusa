const common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require src/support/**/*.ts',
  '--require src/steps/**/*.ts',
  '--format allure-cucumberjs/reporter',
  '--format summary',
  '--format progress-bar',
].join(' ');

module.exports = {
  default: common,
  api: `${common} --tags @api`,
  ui: `${common} --tags @ui`,
};
