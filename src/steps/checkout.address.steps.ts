import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutAddressPage, AddressPayload } from '../pages/CheckoutAddressPage';
import { buildFixture } from '../utils/fixtures';

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Add a product to cart (same discovery loop used in cart.steps.ts)
    const home = new HomePage(this.page);
    await home.open();
    const products = await home.listProducts();

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

    // 2. Navigate to cart and proceed to checkout
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();

    // 3. Confirm we land on the address step
    await this.page.waitForURL(/step=address/, { timeout: 15_000 });
  },
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const payload = buildFixture<AddressPayload>('addresses', {}, 'default');
    this.data.address = payload;

    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.fillAndSubmitAddress(payload);
  },
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const payload = this.data.address as AddressPayload;
    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectEmailSaved(payload.email);
  },
);

Then(
  'the customer remains on the checkout address step without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectRemainsOnAddressStep();
  },
);

// @EP-9
