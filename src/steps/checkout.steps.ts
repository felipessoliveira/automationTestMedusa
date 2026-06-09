import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';
import { buildFixture } from '../utils/fixtures';

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  const address = buildFixture<AddressPayload>('addresses', {}, 'default');
  this.data.address = address;
  await checkout.fillShippingAddress(address);
  await checkout.checkBillingSameAsShipping();
  await checkout.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

// @EP-9
