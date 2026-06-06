import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, CheckoutAddressPayload } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

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
    const payload = buildFixture<CheckoutAddressPayload>('addresses', overrides, template);
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
