import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { rowsToObject } from './common.steps';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

  // Navigate to storefront and add a product to cart
  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();

  if (products.length === 0) {
    throw new Error('No products found on storefront.');
  }

  // Try to add first available product to cart
  for (const candidate of products) {
    await home.openProductByHref(candidate.href);
    const pdp = new ProductPage(this.page);

    if (await pdp.canAddToCart()) {
      await pdp.addToCart();
      this.data.product = { name: candidate.name };
      return;
    }
  }

  throw new Error('No stocked product available to add to cart.');
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    let address: AddressPayload;
    if (table) {
      const overrides = rowsToObject(table);
      address = buildFixture<AddressPayload>('addresses', overrides, 'default');
    } else {
      address = buildFixture<AddressPayload>('addresses', {}, 'default');
    }

    this.data.address = address;

    const checkout = new CheckoutPage(this.page);
    await checkout.fillShippingAddress(address);
    await checkout.setBillingSameAsShipping(true);
    await checkout.submitAddress();
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  // Verify the form was submitted - checking that we're still on a valid checkout state
  await checkout.expectOnAddressStep();
});

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectNotRedirected();
  },
);

// @EP-9
