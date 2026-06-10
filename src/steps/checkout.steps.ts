import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage } from '../pages/CheckoutPage';

Given('the customer navigates to the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters their email and phone with the {string} user template', async function (this: CustomWorld, template: string) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const user = buildFixture<{ email: string; phone: string; first_name: string; last_name: string }>('users', {}, template);
  this.data.user = user;
  const checkout = new CheckoutPage(this.page);
  await checkout.fillContactInfo(user.email, user.phone);
  await checkout.fillShippingAddress(user.first_name, user.last_name);
});

When('the customer submits the address form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.submitAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const user = this.data.user as { email: string };
  const checkout = new CheckoutPage(this.page);
  await checkout.expectEmailSaved(user.email);
});

Then('the customer remains on the checkout address step without being redirected', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

// @EP-9
