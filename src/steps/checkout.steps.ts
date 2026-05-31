import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CartPage } from '../pages/CartPage';

Given('a customer has items in the cart and is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves a valid shipping address', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterShippingAddress({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  });
  await checkout.saveShippingAddress();
});

Then('the shipping address is successfully saved', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectShippingAddressSaved();
});

Then('the customer remains on the page without being redirected to delivery or checkout', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterShippingAddress({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  });
  await checkout.saveShippingAddress();
  await checkout.expectShippingAddressSaved();
});

When('the customer enters and saves a valid billing address and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterBillingAddressAndEmail('john.doe@example.com', {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  });
  await checkout.saveBillingAddressAndEmail();
});

Then('the billing address and email are successfully saved', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectBillingAddressSaved();
});

Then('the customer remains on the page without being redirected', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.enterShippingAddress({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  });
  await checkout.saveShippingAddress();
  await checkout.enterBillingAddressAndEmail('john.doe@example.com', {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
  });
  await checkout.saveBillingAddressAndEmail();
});

When('the customer enters and applies a valid address-dependent promo code', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode('US_DISCOUNT_10');
});

Then('the promo code is successfully applied', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoCodeApplied();
});

When('the customer applies a valid promo code', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode('US_DISCOUNT_10');
});

Then('the cart totals refresh immediately on the page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoCodeApplied();
});

Then('the cart summary displays the correct discount before proceeding to checkout', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const discount = await checkout.getDiscountAmount();
  expect(discount).not.toBe('');
});

Given('a customer has items in the cart and is on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.open();
});

Given('the customer has successfully applied a valid promo code', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode('US_DISCOUNT_10');
  await checkout.expectPromoCodeApplied();
});

When('the customer navigates from the cart page to the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.open();
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

Then('the applied promo code persists on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoCodeApplied();
});

Then('the discount remains reflected in the order summary', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const discount = await checkout.getDiscountAmount();
  expect(discount).not.toBe('');
});
