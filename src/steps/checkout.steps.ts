import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

interface AddressFixture {
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  province?: string;
  email: string;
}

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const cart = new CartPage(this.page);
  await cart.open();
  const items = await cart.getLineItems();
  if (items.length === 0) {
    throw new Error('Cart is empty, precondition not met.');
  }
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const address = buildFixture<AddressFixture>('addresses', {}, 'default');
  this.data.address = address;
  
  const checkout = new CheckoutPage(this.page);
  await checkout.fillShippingAddress(address);
  await checkout.checkBillingSameAsShipping();
  await checkout.fillEmail(address.email);
  await checkout.submitAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = this.data.address as AddressFixture;
  const checkout = new CheckoutPage(this.page);
  
  await expect(checkout.getFirstNameInput()).toHaveValue(address.first_name);
  await expect(checkout.getLastNameInput()).toHaveValue(address.last_name);
  await expect(checkout.getEmailInput()).toHaveValue(address.email);
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  await expect(this.page).not.toHaveURL(/delivery/, { timeout: 5000 });
  await expect(this.page).toHaveURL(/checkout/);
});

// @EP-9
