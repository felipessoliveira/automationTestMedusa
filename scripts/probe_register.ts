import { chromium } from '@playwright/test';

const BASE = 'https://medusa-storefront-839705751382.europe-west1.run.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'es-ES' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/es/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});

  // Click via data-testid, wait longer, observe.
  await page.locator('[data-testid="register-button"]').click();
  await page.waitForTimeout(4000);

  const shape = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.textContent?.trim()),
    inputs: Array.from(document.querySelectorAll('input'))
      .filter((i) => i.type !== 'hidden')
      .map((i) => ({
        name: i.name,
        type: i.type,
        testid: i.getAttribute('data-testid'),
        autoComplete: i.autocomplete,
      })),
    labels: Array.from(document.querySelectorAll('label')).map((l) => l.textContent?.trim()),
    buttons: Array.from(document.querySelectorAll('button'))
      .map((b) => ({ text: b.textContent?.trim(), testid: b.getAttribute('data-testid'), type: b.type })),
  }));
  console.log(JSON.stringify(shape, null, 2));
  await browser.close();
})();
