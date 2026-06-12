import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { config } from '../support/config';

// ── Precondition ─────────────────────────────────────────────────────────────

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();

  if (products.length === 0) {
    throw new Error('No product links were discovered on the storefront.');
  }

  const attempted: string[] = [];

  for (const candidate of products as ProductCandidate[]) {
    await home.openProductByHref(candidate.href);
    const pdp = new ProductPage(this.page);

    if (await pdp.canAddToCart()) {
      const actualName = await pdp.getTitle().catch(() => candidate.name);
      await pdp.addToCart();
      this.data.product = { name: actualName };
      return;
    }

    attempted.push(candidate.name);
    await home.open();
  }

  throw new Error(
    `No stocked product was available to add to cart. Tried: ${attempted.join(', ')}`,
  );
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

  const cart = new CartPage(this.page);
  await cart.open();
  await cart.proceedToCheckout();

  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressStepVisible();
});

// ── Action ────────────────────────────────────────────────────────────────────

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSubmitAddress({
      email: 'qa.checkout@example.com',
      firstName: 'QA',
      lastName: 'Tester',
      address: 'Calle de la Prueba 1',
      city: 'Madrid',
      postalCode: '28001',
      countryCode: 'es',
      phone: '+34600000000',
      sameAsBilling: true,
    });
  },
);

// ── Assertions ────────────────────────────────────────────────────────────────

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved();
});

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const currentUrl = this.page.url();
    expect(
      currentUrl,
      `Expected to remain on the checkout address step but was redirected to: ${currentUrl}`,
    ).toContain('/checkout');

    expect(
      currentUrl,
      `Expected URL NOT to include step=delivery but got: ${currentUrl}`,
    ).not.toContain('step=delivery');
  },
);

// @EP-9
