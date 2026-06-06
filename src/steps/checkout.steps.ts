import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage, ShippingAddress } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

// Default shipping/billing address used for the checkout address step.
// The repository's buildFixture helper only supports 'users' and 'products'
// fixture kinds, so the address default is defined locally here.
const DEFAULT_ADDRESS: ShippingAddress = {
  first_name: 'Felipe',
  last_name: 'Oliveira',
  address_1: 'Calle Mayor 1',
  postal_code: '28013',
  city: 'Madrid',
  country_code: 'es',
  province: 'Madrid',
  email: 'qa.checkout@example.com',
  phone: '600123456',
};

function buildAddress(overrides: Record<string, string>): ShippingAddress {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(overrides)) {
    resolved[key] = value.replace('<timestamp>', String(Date.now()));
  }
  return { ...DEFAULT_ADDRESS, ...resolved } as ShippingAddress;
}

Given('I am on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.openAddressStep();
});

When(
  'I save the shipping address, billing address, and email with:',
  async function (this: CustomWorld, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const address = buildAddress(overrides);
    this.data.address = address;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSaveAddress(address);
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = this.data.address as ShippingAddress;
  if (!address) throw new Error('No address fixture was captured for the checkout assertion.');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(address);
});

Then(
  'I remain on the checkout page without being redirected to the delivery step',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectStillOnCheckoutAddressStep();
  },
);

// @EP-9
