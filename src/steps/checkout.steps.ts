import { Given, When, Then } from '@cucumber/cucumber';
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
  await checkout.enterShippingAndBillingAddress(
    'test.checkout@example.com',
    '123 Shipping St, Test City',
    '123 Billing St, Test City'
  );
  await checkout.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSavedSuccessfully();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnCheckoutPageWithoutRedirection();
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterShippingAndBillingAddress(
    'test.checkout@example.com',
    '123 Shipping St, Test City',
    '123 Billing St, Test City'
  );
  await checkout.saveAddress();
  await checkout.expectAddressSavedSuccessfully();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode(promoCode);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoApplied(promoCode);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectTotalsRefreshed();
});
