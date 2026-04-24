// Seeds the shared login user used by the @ui @auth scenario.
//
// Reads credentials from fixtures/users/login.json (email + password) and
// fills in the remaining required customer fields from fixtures/users/default.json.
// Idempotent: if the identity or customer already exists the script succeeds.
//
// Run: npx ts-node scripts/seed_shared_user.ts
//
// Requires MEDUSA_API_URL + MEDUSA_PUBLISHABLE_KEY in .env.

import 'dotenv/config';
import { request } from '@playwright/test';
import { config, assertApiConfigured } from '../src/support/config';
import { CustomerClient } from '../src/api/clients/customerClient';
import { loadFixture, mergeFixture } from '../src/utils/fixtures';
import type { RegisterCustomerPayload } from '../src/api/models/customer';

(async () => {
  assertApiConfigured();

  const base = loadFixture<RegisterCustomerPayload>('users', 'default');
  const loginOverrides = loadFixture<Record<string, unknown>>('users', 'login');
  const payload = mergeFixture<RegisterCustomerPayload>(base, loginOverrides);

  const api = await request.newContext({
    baseURL: config.api.url,
    extraHTTPHeaders: { 'x-publishable-api-key': config.api.publishableKey },
  });
  const client = new CustomerClient(api);

  console.log(`→ Seeding shared user: ${payload.email}`);
  const { response, body } = await client.register(payload);
  const status = response.status();

  if (response.ok() && body.customer?.id) {
    console.log(`✓ Created customer ${body.customer.id} (${body.customer.email})`);
  } else if (status === 401 || status === 422 || status === 409 || status === 400) {
    // Medusa returns 401 when the auth identity already exists (token endpoint
    // refuses to re-register). 409/422/400 covers other "already exists" shapes.
    const text = await response.text().catch(() => '');
    console.log(`✓ User already exists (HTTP ${status}) — treating as success.`);
    console.log(`  response: ${text.slice(0, 200)}`);
  } else {
    const text = await response.text().catch(() => '');
    console.error(`✗ Unexpected response (HTTP ${status}): ${text.slice(0, 300)}`);
    process.exitCode = 1;
  }

  await api.dispose();
})();
