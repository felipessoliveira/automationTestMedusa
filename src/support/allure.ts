import { Before } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// The Allure reporter is wired up via the `--format allure-cucumberjs/reporter`
// flag in cucumber.js. This file is a hook for per-scenario Allure metadata
// (labels, links, severity) that should apply to every scenario.
//
// Tag-driven labels: @api -> layer=api, @ui -> layer=ui.

Before(function (this: CustomWorld, { pickle }) {
  const tags = pickle.tags.map((t) => t.name);

  if (tags.includes('@api')) {
    this.attach(JSON.stringify({ layer: 'api' }), 'application/vnd.allure.label+json');
  }
  if (tags.includes('@ui')) {
    this.attach(JSON.stringify({ layer: 'ui' }), 'application/vnd.allure.label+json');
  }
});
