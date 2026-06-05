import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();
  if (products.length === 0) {
    throw new Error('No product links were discovered on the storefront.');
  }
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  await pdp.addToCart();
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.fillAddressDetails({
    email: 'qa.checkout@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Madrid',
    countryCode: 'es',
    province: 'Madrid',
    phone: '1234567890'
  });
  await checkout.checkBillingSameAsShipping();
  await checkout.submitAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await expect(this.page.getByTestId('shipping-email-input')).toHaveValue('qa.checkout@example.com');
  await expect(this.page.getByTestId('shipping-first-name-input')).toHaveValue('John');
});

Then('the customer remains on the checkout page at the delivery step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await this.page.waitForTimeout(2000);
  await checkout.expectUrlContains('step=delivery');
});

// @EP-9
