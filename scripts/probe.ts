// Ad-hoc probe of the live Medusa storefront to inform selector + feature fixes.
// Run: npx ts-node scripts/probe.ts
import { chromium } from '@playwright/test';

const BASE = 'https://medusa-storefront-839705751382.europe-west1.run.app';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: 'es-ES' });
  const page = await ctx.newPage();

  // --- /es/store: list products with stock status ---
  await page.goto(`${BASE}/es/store`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  const products = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/products/"]'));
    return anchors.slice(0, 20).map((a) => ({
      href: (a as HTMLAnchorElement).getAttribute('href'),
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 140),
    }));
  });
  console.log('--- /es/store product links ---');
  console.log(JSON.stringify(products, null, 2));

  // --- Visit each product and report stock + add-to-cart state ---
  const uniq = Array.from(new Map(products.map((p) => [p.href, p])).values()).slice(0, 8);
  for (const p of uniq) {
    if (!p.href) continue;
    const url = p.href.startsWith('http') ? p.href : `${BASE}${p.href}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const info = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="add-product-button"]') as HTMLButtonElement | null;
      const h1 = document.querySelector('h1');
      const variants = Array.from(document.querySelectorAll('button[data-testid="option-button"], [role="radio"]')).map(
        (v) => ({
          text: (v.textContent || '').trim(),
          disabled: (v as HTMLButtonElement).disabled || v.getAttribute('aria-disabled') === 'true',
        }),
      );
      return {
        title: h1?.textContent?.trim() ?? null,
        btnText: btn?.textContent?.trim() ?? null,
        btnDisabled: btn?.disabled ?? null,
        variants,
      };
    });
    console.log('---', url);
    console.log(JSON.stringify(info, null, 2));
  }

  // --- /es/account structure ---
  await page.goto(`${BASE}/es/account`, { waitUntil: 'domcontentloaded' });
  const accountShape = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input')).map((i) => ({
      name: i.getAttribute('name'),
      type: i.getAttribute('type'),
      placeholder: i.getAttribute('placeholder'),
      id: i.id || null,
    }));
    const buttons = Array.from(document.querySelectorAll('button, a')).slice(0, 20).map((b) => ({
      tag: b.tagName.toLowerCase(),
      text: (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      href: (b as HTMLAnchorElement).href ?? null,
    }));
    return { url: location.href, inputs, buttons };
  });
  console.log('--- /es/account ---');
  console.log(JSON.stringify(accountShape, null, 2));

  // --- Try the register page directly ---
  for (const path of ['/es/account/register', '/es/account?view=register']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const reg = await page.evaluate(() => ({
      url: location.href,
      inputs: Array.from(document.querySelectorAll('input')).map((i) => ({
        name: i.getAttribute('name'),
        type: i.getAttribute('type'),
        placeholder: i.getAttribute('placeholder'),
      })),
    }));
    console.log(`--- GET ${path} ---`);
    console.log(JSON.stringify(reg, null, 2));
  }

  await browser.close();
})();
