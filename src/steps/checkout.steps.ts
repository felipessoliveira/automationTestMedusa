import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillShippingAndBilling('qa.medusa.' + Date.now() + '@example.com');
  await checkoutPage.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectAddressSavedSuccessfully();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectUrlContains('/checkout');
  await this.page.waitForTimeout(1000);
  await checkoutPage.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillShippingAndBilling('qa.medusa.' + Date.now() + '@example.com');
  await checkoutPage.saveAddress();
  await checkoutPage.expectAddressSavedSuccessfully();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.applyPromoCode(code);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectPromoApplied(code);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectTotalsRefreshed();
});
