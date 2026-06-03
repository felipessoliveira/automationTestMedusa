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
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { CustomWorld } from './world';
import { config } from './config';
import { launchOptions, contextOptions } from '../../playwright.config';

setDefaultTimeout(60_000);

let browser: Browser | undefined;
const traceDir = path.join('reports', 'traces');

function traceFileName(scenario: ITestCaseHookParameter): string {
  const slug = scenario.pickle.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'scenario';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `${slug}-${timestamp}.zip`;
}

AfterAll(async () => {
  await browser?.close();
});

Before({ tags: '@ui' }, async function (this: CustomWorld) {
  if (!browser) {
    browser = await chromium.launch(launchOptions);
  }
  this.browser = browser;
  this.context = await browser.newContext(contextOptions);
  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });
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
  const failed = scenario.result?.status === Status.FAILED;

  if (failed && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
    const html = await this.page.content();
    this.attach(html, 'text/html');
  }

  if (this.context) {
    try {
      if (failed) {
        await mkdir(traceDir, { recursive: true });
        const tracePath = path.join(traceDir, traceFileName(scenario));

        await this.context.tracing.stop({ path: tracePath });

        const trace = await readFile(tracePath);
        this.attach(trace, 'application/zip');
      } else {
        await this.context.tracing.stop();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.attach(`Playwright trace capture failed: ${message}`, 'text/plain');
    }
  }

  await this.page?.close();
  await this.context?.close();
});

After({ tags: '@api' }, async function (this: CustomWorld) {
  await this.api?.dispose();
});
