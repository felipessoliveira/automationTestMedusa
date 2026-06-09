import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';

Given('I am on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'I enter and save the shipping address, billing address, and email using the {string} address template',
  async function (this: CustomWorld, template: string) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const address = buildFixture<AddressPayload>('addresses', {}, template);
    this.data.address = address;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillShippingAddress(address);
    await checkout.setBillingSameAsShipping(address.same_billing);
    await checkout.submitAddress();
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const address = this.data.address as AddressPayload;
  await checkout.expectFieldValue('shipping-first-name-input', address.first_name);
  await checkout.expectFieldValue('shipping-last-name-input', address.last_name);
  await checkout.expectFieldValue('shipping-email-input', address.email);
});

Then('the customer remains on the checkout page without being redirected', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
  await checkout.expectCheckoutContainerVisible();
});

// @EP-9
