import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test';

export interface ScenarioData {
  user?: unknown;
  product?: unknown;
  apiResponse?: unknown;
  [key: string]: unknown;
}

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  api?: APIRequestContext;
  data: ScenarioData = {};

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
