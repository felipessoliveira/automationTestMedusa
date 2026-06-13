import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * EP-9 — checkout address step definitions.
 *
 * Given: a customer has items in their cart and is on the checkout page
 * When:  the customer enters and saves their shipping address, billing address, and email
 * Then:  the address and email details are saved successfully
 * And:   the customer remains on the checkout page without being redirected
 */

Given(
  'a customer has items in their cart and is on the checkout page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // Add a product to the cart by iterating candidates (same pattern as cart.steps.ts)
    const home = new HomePage(this.page);
    await home.open();
    const products: ProductCandidate[] = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    let addedToCart = false;
    const attempted: string[] = [];

    for (const candidate of products) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);

      if (await pdp.canAddToCart()) {
        await pdp.addToCart();
        addedToCart = true;
        break;
      }

      attempted.push(candidate.name);
      await home.open();
    }

    if (!addedToCart) {
      throw new Error(
        `No stocked product was available to add to cart. Tried: ${attempted.join(', ')}`,
      );
    }

    // Navigate to the checkout address step
    const checkout = new CheckoutPage(this.page);
    await checkout.open();
  },
);

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSubmitAddress({
      firstName: 'QA',
      lastName: 'Tester',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postalCode: '28001',
      countryCode: 'es',
      email: 'qa.checkout@example.com',
      phone: '+34600000000',
    });
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectAddressSaved();
  },
);

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectNotRedirectedToDelivery();
  },
);

// @EP-9
