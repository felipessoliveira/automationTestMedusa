import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, ShippingAddress } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

Given('I am on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.openAddressStep();
});

When(
  'I save the shipping address, billing address, and email using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const address = buildFixture<ShippingAddress>('addresses', overrides, template);
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
