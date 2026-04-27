import {
  Before,
  BeforeAll,
  After,
  AfterAll,
  Status,
  setDefaultTimeout,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { chromium, request, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './config';
import { launchOptions, contextOptions } from '../../playwright.config';

setDefaultTimeout(60_000);

let browser: Browser | undefined;

AfterAll(async () => {
  await browser?.close();
});

Before({ tags: '@ui' }, async function (this: CustomWorld) {
  if (!browser) {
    browser = await chromium.launch(launchOptions);
  }
  this.browser = browser;
  this.context = await browser.newContext(contextOptions);
  this.page = await this.context.newPage();
});

Before({ tags: '@api' }, async function (this: CustomWorld) {
  this.api = await request.newContext({
    baseURL: config.api.url || config.baseUrl,
    extraHTTPHeaders: config.api.publishableKey
      ? { 'x-publishable-api-key': config.api.publishableKey }
      : {},
  });
});

After({ tags: '@ui' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
    const html = await this.page.content();
    this.attach(html, 'text/html');
  }
  await this.page?.close();
  await this.context?.close();
});

After({ tags: '@api' }, async function (this: CustomWorld) {
  await this.api?.dispose();
});
