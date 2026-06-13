import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutAddressPage } from '../pages/CheckoutAddressPage';

// ---------------------------------------------------------------------------
// Shared address fixture used for checkout address scenarios
// ---------------------------------------------------------------------------
const TEST_ADDRESS = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle Gran Via 1',
  city: 'Madrid',
  postalCode: '28013',
  countryCode: 'es',
  email: 'qa.checkout@example.com',
  phone: '+34600000000',
};

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Add a stocked product to the cart (replicates cart.steps.ts discovery logic)
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

    // 2. Navigate to checkout address step
    const checkout = new CheckoutAddressPage(this.page);
    await checkout.open();
    this.data.checkoutAddressPage = checkout;
  },
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout =
      (this.data.checkoutAddressPage as CheckoutAddressPage) ??
      new CheckoutAddressPage(this.page);
    await checkout.fillAndSave(TEST_ADDRESS);
  },
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout =
      (this.data.checkoutAddressPage as CheckoutAddressPage) ??
      new CheckoutAddressPage(this.page);
    await checkout.expectAddressSaved();
  },
);

Then(
  'the customer remains on the checkout page without being redirected to the delivery step',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout =
      (this.data.checkoutAddressPage as CheckoutAddressPage) ??
      new CheckoutAddressPage(this.page);
    await checkout.expectRemainsOnCheckout();
  },
);

// @EP-9
