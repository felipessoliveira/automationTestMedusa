import type { LaunchOptions, BrowserContextOptions } from '@playwright/test';

// Cucumber is the runner here; these exports are shared defaults consumed by
// src/support/hooks.ts when launching Chromium / creating browser contexts.
// They also make `npx playwright codegen` pick up our baseURL.

export const launchOptions: LaunchOptions = {
  headless: process.env.HEADED !== '1',
  slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) : 0,
};

export const contextOptions: BrowserContextOptions = {
  viewport: { width: 1440, height: 900 },
  locale: 'es-ES',
  recordVideo: process.env.RECORD_VIDEO === '1' ? { dir: 'reports/videos' } : undefined,
};

export default {
  use: {
    baseURL: process.env.BASE_URL ?? 'https://medusa-storefront-839705751382.europe-west1.run.app',
  },
};
