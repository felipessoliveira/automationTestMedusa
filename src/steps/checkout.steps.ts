import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, CheckoutAddress } from '../pages/CheckoutPage';
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
    const addr = buildFixture<CheckoutAddress>('addresses', overrides, template);
    this.data.address = addr;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSaveAddress(addr);
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const addr = this.data.address as CheckoutAddress;
  if (!addr) throw new Error('No address was captured for the checkout assertion.');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(addr);
});

Then('I remain on the checkout page without being redirected to the delivery step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectStillOnCheckout();
});

// @EP-9
