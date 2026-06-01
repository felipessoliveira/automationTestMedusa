import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
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

  for (const candidate of products) {
    await home.openProductByHref(candidate.href);
    const pdp = new ProductPage(this.page);

    if (await pdp.canAddToCart()) {
      await pdp.addToCart();
      return;
    }
    await home.open();
  }
  throw new Error('No stocked product was available to add to cart.');
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
    city: 'Testville',
    postalCode: '12345',
    country: 'United States'
  });
  
  await checkout.enterBillingAddress({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Testville',
    postalCode: '12345',
    country: 'United States'
  });
  
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
  await checkout.expectUrlContains('/checkout');
  await this.page.waitForTimeout(2000);
  await checkout.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  
  await checkout.enterShippingAddress({
    email: 'test.customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Testville',
    postalCode: '12345',
    country: 'United States'
  });
  
  await checkout.enterBillingAddress({
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Testville',
    postalCode: '12345',
    country: 'United States'
  });
  
  await checkout.saveAddress();
  await checkout.expectAddressSavedSuccessfully();
  
  const initialTotal = await checkout.getCartTotal();
  this.data.initialTotal = initialTotal;
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode(promoCode);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, promoCode: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoAppliedSuccessfully(promoCode);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  
  const discount = await checkout.getDiscountAmount();
  expect(discount).not.toBe('');
  expect(discount).not.toBe('$0.00');
  
  const currentTotal = await checkout.getCartTotal();
  const initialTotal = this.data.initialTotal as string;
  expect(currentTotal).not.toBe(initialTotal);
});