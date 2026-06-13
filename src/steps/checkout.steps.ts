import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';

/**
 * Default address payload used for EP-9 checkout address scenarios.
 * Kept inline to avoid an additional fixture file dependency for a single scenario.
 */
const DEFAULT_ADDRESS: AddressPayload = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle Gran Via 1',
  city: 'Madrid',
  postalCode: '28013',
  countryCode: 'ES',
  email: 'qa.checkout@example.com',
  phone: '+34600000000',
};

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // Add a stocked product to the cart by reusing the existing home → PDP flow
    const home = new HomePage(this.page);
    await home.open();
    const products: ProductCandidate[] = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    let added = false;
    const attempted: string[] = [];

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

    // Navigate to checkout address step via the cart page checkout button
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();
    await this.page.waitForURL(/checkout.*step=address/, { timeout: 15_000 });
  },
);

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    this.data.checkoutAddress = DEFAULT_ADDRESS;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSubmitAddress(DEFAULT_ADDRESS);
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const address = this.data.checkoutAddress as AddressPayload;
    // The submit-address-button click must not have thrown and the email
    // input should still reflect the value that was saved.
    const checkout = new CheckoutPage(this.page);
    await checkout.expectEmailIsSaved(address.email);
  },
);

Then(
  'the customer remains on the checkout address page without being redirected to the delivery step',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectStillOnAddressStep();
    // Explicitly assert the URL does NOT contain step=delivery
    await expect(this.page).not.toHaveURL(/checkout.*step=delivery/, { timeout: 5_000 });
  },
);

// @EP-9
