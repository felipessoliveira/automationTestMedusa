import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { CheckoutAddressPage } from '../pages/CheckoutAddressPage';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { config } from '../support/config';

// ---------------------------------------------------------------------------
// Precondition: customer has items in their cart and is on the checkout page
// ---------------------------------------------------------------------------
Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Add a product to the cart via the storefront (replicates cart.steps logic).
    const home = new HomePage(this.page);
    await home.open();
    const products = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    let added = false;
    const attempted: string[] = [];

    for (const candidate of products as ProductCandidate[]) {
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

    // 2. Navigate to cart and proceed to checkout.
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();

    // 3. Confirm we are on the checkout address step.
    await expect(this.page).toHaveURL(/checkout\?step=address/, { timeout: 15_000 });
  },
);

// ---------------------------------------------------------------------------
// Action: fill in and save address + email
// ---------------------------------------------------------------------------
When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkoutPage = new CheckoutAddressPage(this.page);
    const testEmail = config.testUser.email;

    // countryCode uses lowercase to match Medusa's ISO country code option values.
    const payload = {
      firstName: 'QA',
      lastName: 'Tester',
      address: 'Calle Gran Via 1',
      city: 'Madrid',
      postalCode: '28013',
      countryCode: 'es',
      email: testEmail,
    };

    this.data.checkoutEmail = testEmail;
    await checkoutPage.fillAndSubmitAddress(payload);
  },
);

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkoutPage = new CheckoutAddressPage(this.page);
    const email = this.data.checkoutEmail as string;
    await checkoutPage.expectEmailVisible(email);
  },
);

Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectStillOnAddressStep();
  },
);

// @EP-9
