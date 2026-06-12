import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutAddressPage } from '../pages/CheckoutAddressPage';

// ---------------------------------------------------------------------------
// Precondition: customer has items in cart and lands on checkout address page
// ---------------------------------------------------------------------------
Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Navigate home and pick any stocked product
    const home = new HomePage(this.page);
    await home.open();
    const products: ProductCandidate[] = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    let added = false;
    for (const candidate of products) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);
      if (await pdp.canAddToCart()) {
        await pdp.addToCart();
        added = true;
        break;
      }
      await home.open();
    }

    if (!added) {
      throw new Error('No stocked product was available to add to cart.');
    }

    // 2. Navigate to cart and proceed to checkout
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();
    await this.page.waitForURL(/checkout.*step=address/, { timeout: 15_000 });
  },
);

// ---------------------------------------------------------------------------
// Action: fill and submit shipping address, billing address, and email
// ---------------------------------------------------------------------------
When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkoutPage = new CheckoutAddressPage(this.page);

    const address = {
      firstName: 'QA',
      lastName: 'Tester',
      address: 'Calle Gran Via 1',
      postalCode: '28013',
      city: 'Madrid',
      countryCode: 'es',
      email: 'qa.checkout@example.com',
      phone: '+34600000001',
    };

    this.data['checkoutEmail'] = address.email;

    await checkoutPage.fillShippingAddress(address);
    await checkoutPage.submitAddress();
  },
);

// ---------------------------------------------------------------------------
// Assertion: address and email saved successfully
// ---------------------------------------------------------------------------
Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    // The submit-address-button should no longer be visible OR the email field
    // retains its value, proving the form was accepted without an error state.
    // We check the button is either gone or disabled as a proxy for success.
    const submitBtn = this.page.getByTestId('submit-address-button');
    const isVisible = await submitBtn.isVisible().catch(() => false);
    if (isVisible) {
      // If still visible (e.g. accordion collapsed), confirm it is not showing
      // a validation error by verifying the email field value was preserved.
      const checkoutPage = new CheckoutAddressPage(this.page);
      await checkoutPage.expectEmailSaved(this.data['checkoutEmail'] as string);
    }
    // No error banner should be present
    const errorBanner = this.page.locator('[data-testid="address-error"]');
    const errorCount = await errorBanner.count();
    expect(errorCount).toBe(0);
  },
);

// ---------------------------------------------------------------------------
// Assertion: customer remains on checkout address page (no redirect)
// ---------------------------------------------------------------------------
Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectStillOnAddressStep();
  },
);

// @EP-9
