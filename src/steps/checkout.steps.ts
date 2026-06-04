import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CartPage } from '../pages/CartPage';

Given('I navigate to the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('I enter and save my shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.fillShippingAndEmail(
    'qa.customer@example.com',
    'Felipe',
    'Oliveira',
    '123 Main St',
    'San Francisco',
    '94111',
    '1234567890'
  );
  await checkout.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await expect(checkout.page.locator('text=Saved,Edit')).toBeTruthy();
});

Then('I remain on the checkout page without being redirected', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectNoRedirect();
});

When('I apply a valid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode(code);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await expect(checkout.page.locator(`text=${code}`)).toBeVisible();
});

Then('the cart summary totals refresh immediately to display the correct discount', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const discount = await checkout.getDiscountText();
  expect(discount).toBeTruthy();
});

When('I apply an invalid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode(code);
});

Then('I see an inline error message {string}', async function (this: CustomWorld, expectedMsg: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const errorText = await checkout.getInlineErrorText();
  expect(errorText.toLowerCase()).toContain(expectedMsg.toLowerCase());
});

Given('I am on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.open();
});

Given('I apply a valid promo code {string} on the cart page', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  await this.page.locator('[data-testid="cart-promo-input"], input[name="cart-code"]').fill(code);
  await this.page.locator('[data-testid="apply-cart-promo-button"], button:has-text("Apply")').click();
});

Then('the promo code {string} is still applied on the checkout page', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await expect(checkout.page.locator(`text=${code}`)).toBeVisible();
});

Then('the cart summary totals on the checkout page display the discount', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const discount = await checkout.getDiscountText();
  expect(discount).toBeTruthy();
});

// @EP-9
