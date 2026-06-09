import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

Given('I am on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'the customer enters and saves their shipping address, billing address, and email using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const address = buildFixture<AddressPayload>('addresses', overrides, template);
    this.data.address = address;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillShippingAddress(address);
    await checkout.checkBillingSameAsShipping();
    await checkout.saveAddress();
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = this.data.address as AddressPayload;
  if (!address) throw new Error('No address data was captured for the assertion.');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(address.first_name, address.last_name, address.email);
});

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectOnCheckoutPage();
    await checkout.expectUrlContainsAddressStep();
  },
);

// @EP-9
