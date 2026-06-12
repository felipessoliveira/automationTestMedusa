import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, ShippingAddress } from '../pages/CheckoutPage';
import { config } from '../support/config';

// ── Shared test address fixture ───────────────────────────────────────────────

const TEST_ADDRESS: ShippingAddress = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle de la Prueba 1',
  city: 'Madrid',
  postalCode: '28001',
  countryCode: 'es',
  email: config.testUser.email,
};

// ── Given ─────────────────────────────────────────────────────────────────────

Given(
  'a customer has items in their cart and is on the checkout address step',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Find and add any in-stock product to the cart
    const home = new HomePage(this.page);
    await home.open();
    const products: ProductCandidate[] = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    const attempted: string[] = [];
    let added = false;

    for (const candidate of products) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);

      if (await pdp.canAddToCart()) {
        await pdp.addToCart();
        added = true;
        break;
      }

      attempted.push(candidate.name);
      await home.open();
    }

    if (!added) {
      throw new Error(
        `No stocked product was available to add to cart. Tried: ${attempted.join(', ')}`,
      );
    }

    // 2. Navigate from cart to checkout address step
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();

    // 3. Wait for the address step to be ready
    const checkout = new CheckoutPage(this.page);
    await checkout.expectAddressStepVisible();
  },
);

// ── When ──────────────────────────────────────────────────────────────────────

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);

    // Fill shipping (includes email)
    await checkout.fillShippingAddress(TEST_ADDRESS);

    // Fill billing with same data (unchecks "same as shipping" to exercise the field)
    await checkout.fillBillingAddress(TEST_ADDRESS);

    // Store address in scenario data for later assertions
    this.data.checkoutAddress = TEST_ADDRESS;

    // Submit
    await checkout.submitAddress();
  },
);

// ── Then ──────────────────────────────────────────────────────────────────────

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    const address = this.data.checkoutAddress as ShippingAddress;
    await checkout.expectEmailSaved(address.email);
  },
);

Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectRemainsOnAddressStep();
  },
);

// @EP-9
