// Read-only probe: opens the live storefront and prints the Medusa backend
// URL + x-publishable-api-key discovered from outgoing /store/* requests.
//
// Run: npx ts-node scripts/discover_backend.ts
// Then copy the printed values into .env as MEDUSA_API_URL / MEDUSA_PUBLISHABLE_KEY.

import 'dotenv/config';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://medusa-storefront-839705751382.europe-west1.run.app';
const LOCALE = process.env.LOCALE ?? 'es';

type Hit = { origin: string; pathname: string; publishableKey?: string };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const hits: Hit[] = [];

  page.on('request', (req) => {
    try {
      const rt = req.resourceType();
      if (rt !== 'xhr' && rt !== 'fetch') return;
      const url = new URL(req.url());
      if (url.pathname.startsWith('/_next/')) return;
      const headers = req.headers();
      hits.push({
        origin: url.origin,
        pathname: url.pathname,
        publishableKey: headers['x-publishable-api-key'] ?? headers['x-publishable-key'],
      });
    } catch {
      /* ignore */
    }
  });

  // Visit two pages that force product/region calls.
  await page.goto(`${BASE}/${LOCALE}/store`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.goto(`${BASE}/${LOCALE}/products/t-shirt`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});

  await browser.close();

  if (hits.length === 0) {
    console.error('No /store/* requests observed. The storefront may proxy server-side — check Next.js server logs instead.');
    process.exitCode = 1;
    return;
  }

  const origins = new Set(hits.map((h) => h.origin));
  const keys = new Set(hits.map((h) => h.publishableKey).filter(Boolean) as string[]);

  console.log('--- Distinct Medusa backend origins observed ---');
  for (const o of origins) console.log('  ' + o);

  console.log('\n--- Distinct x-publishable-api-key values observed ---');
  if (keys.size === 0) console.log('  (none — header may be attached server-side only)');
  for (const k of keys) console.log('  ' + k);

  console.log('\n--- Example hits (first 5) ---');
  for (const h of hits.slice(0, 5)) {
    console.log(`  ${h.origin}${h.pathname}  pk=${h.publishableKey ?? '-'}`);
  }

  console.log('\nSuggested .env values:');
  const origin = [...origins][0];
  const key = [...keys][0] ?? '<not-found-on-client-requests>';
  console.log(`  MEDUSA_API_URL=${origin}`);
  console.log(`  MEDUSA_PUBLISHABLE_KEY=${key}`);
})();
