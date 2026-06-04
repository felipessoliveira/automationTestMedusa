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
    throw new Error('No products found on storefront');
  }
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  await pdp.addToCart();
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillShippingAndBilling(
    'qa.test.user@example.com',
    'John',
    'Doe',
    '123 Test St',
    'Testville',
    '12345',
    '1234567890'
  );
  await checkoutPage.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectAddressSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectUrlContains('/checkout');
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/delivery');
  expect(currentUrl).not.toContain('/payment');
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillShippingAndBilling(
    'qa.test.user@example.com',
    'John',
    'Doe',
    '123 Test St',
    'Testville',
    '12345',
    '1234567890'
  );
  await checkoutPage.saveAddress();
  await checkoutPage.expectAddressSaved();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.applyPromo(promoCode);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectPromoApplied(promoCode);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectTotalsRefreshed();
});