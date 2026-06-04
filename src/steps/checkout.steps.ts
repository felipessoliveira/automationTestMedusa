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
    throw new Error('No product links were discovered on the storefront.');
  }
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  if (await pdp.canAddToCart()) {
    await pdp.addToCart();
  } else {
    throw new Error('Unable to add default product to cart');
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
  await checkout.fillAndSaveDetails({
    email: 'felipe.qa@example.com',
    shipping: {
      firstName: 'Felipe',
      lastName: 'Oliveira',
      address: 'Avenue of the Americas 123',
      city: 'New York',
      postalCode: '10001',
      country: 'United States'
    },
    billing: {
      sameAsShipping: true
    }
  });
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectDetailsSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.fillAndSaveDetails({
    email: 'felipe.qa@example.com',
    shipping: {
      firstName: 'Felipe',
      lastName: 'Oliveira',
      address: 'Avenue of the Americas 123',
      city: 'New York',
      postalCode: '10001',
      country: 'United States'
    },
    billing: {
      sameAsShipping: true
    }
  });
  await checkout.expectDetailsSaved();
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
  await checkout.expectTotalsRefreshedWithDiscount();
});

// @EP-9
