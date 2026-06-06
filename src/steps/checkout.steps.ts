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
    throw new Error('No products available on the storefront');
  }
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  if (await pdp.canAddToCart()) {
    await pdp.addToCart();
  } else {
    throw new Error('First product is not in stock / cannot be added to cart');
  }
});

Given('the customer is on the checkout page', async function (this: CustomWorld) { 
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterShippingDetails({
    email: 'qa.checkout.test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    phone: '1234567890',
    countryCode: 'es'
  });
  await checkout.submitAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const emailInput = this.page.getByTestId('shipping-email-input');
  await expect(emailInput).toHaveValue('qa.checkout.test@example.com');
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressStepActive();
});

// @EP-9
