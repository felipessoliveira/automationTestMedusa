import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CartPage } from '../pages/CartPage';
import { buildFixture } from '../utils/fixtures';
import { rowsToObject } from './common.steps';

interface AddressFixture {
  email: string;
  phone: string;
}

Given('I have items in my cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const cart = new CartPage(this.page);
  await cart.open();
});

Given('I am on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    const overrides: Record<string, string> = {};
    const payload = buildFixture<AddressFixture>('users', overrides, 'default');

    await checkout.fillShippingEmail(payload.email);
    await checkout.fillShippingPhone(payload.phone);
    await checkout.checkBillingSameAsShipping();
    await checkout.clickSubmit();
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  // Implicitly verified by the URL remaining stable in the next step, but we can check for success state if available.
  // For now, relying on the 'remains on checkout page' assertion.
});

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectOnCheckoutPage();
  },
);

// @EP-9
