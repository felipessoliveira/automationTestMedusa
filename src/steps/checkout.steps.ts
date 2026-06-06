import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();
  if (products.length === 0) {
    throw new Error('No products found on the storefront');
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
  await checkout.enterShippingAddress({
    email: 'test.customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    postalCode: '12345',
    city: 'Test City',
    countryCode: 'es',
    phone: '1234567890'
  });
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
  await checkout.expectUrlContains('checkout');
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('step=delivery');
});

// @EP-9
