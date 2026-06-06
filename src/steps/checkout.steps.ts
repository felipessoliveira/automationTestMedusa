import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage, CheckoutAddressPayload } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

// Default checkout address template. The QA flow only needs a single template
// ("default"), so we keep the fixture inline here rather than introducing a new
// FixtureKind that the shared buildFixture helper does not support.
const ADDRESS_TEMPLATES: Record<string, CheckoutAddressPayload> = {
  default: {
    email: 'qa.checkout@example.com',
    first_name: 'Felipe',
    last_name: 'Oliveira',
    address: 'Calle Mayor 1',
    postal_code: '28013',
    city: 'Madrid',
    country_code: 'es',
    province: 'Madrid',
    phone: '600123456',
  },
};

function buildAddressFixture(
  template: string,
  overrides: Record<string, string>,
): CheckoutAddressPayload {
  const base = ADDRESS_TEMPLATES[template];
  if (!base) {
    throw new Error(`Unknown checkout address template: ${template}`);
  }
  const resolved: CheckoutAddressPayload = { ...base, ...overrides } as CheckoutAddressPayload;
  if (resolved.email && resolved.email.includes('<timestamp>')) {
    resolved.email = resolved.email.replace('<timestamp>', String(Date.now()));
  }
  return resolved;
}

Given('I am on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.openAddressStep();
});

When(
  'I save the checkout address details using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildAddressFixture(template, overrides);
    this.data.address = payload;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAddress(payload);
    await checkout.ensureBillingSameAsShipping();
    await checkout.save();
  },
);

Then('the checkout address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const payload = this.data.address as CheckoutAddressPayload;
  if (!payload) throw new Error('No address payload was captured for the checkout assertion.');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(payload);
});

Then('I remain on the checkout page without being redirected to the delivery step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectStillOnCheckoutWithoutDelivery();
});

// @EP-9
