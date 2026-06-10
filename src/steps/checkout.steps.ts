import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, AddressFixture } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';
import { CartPage } from '../pages/CartPage';

interface AddressPayload {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
}

Given('I have a product in my cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const cart = new CartPage(this.page);
  await cart.open();
  // Reusing existing logic to add a product if cart is empty
  // In a real scenario, we might check if cart is empty first
  await cart.addSampleProduct();
});

Given('I am on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'I enter shipping address details using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: any) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<AddressPayload>('addresses', overrides, template);
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAddress(payload);
  },
);

When(
  'I enter billing address details using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: any) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<AddressPayload>('addresses', overrides, template);
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAddress(payload);
  },
);

When('I enter email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  // Using a fixture value for email
  const email = this.data.user?.email || 'qa.test@example.com';
  await checkout.fillEmail(email);
});

When('I submit the address form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.submit();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectSuccess();
});

Then('I remain on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnCheckoutPage();
});

// @EP-9
