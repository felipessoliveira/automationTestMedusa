import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
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
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.enterShippingDetails('123 Shipping St', '456 Billing Rd', 'test@example.com');
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
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.enterShippingDetails('123 Shipping St', '456 Billing Rd', 'test@example.com');
  await checkoutPage.saveAddress();
  await checkoutPage.expectAddressSaved();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.applyPromo(code);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectPromoApplied(code);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectDiscountDisplayed();
});

// @EP-9
