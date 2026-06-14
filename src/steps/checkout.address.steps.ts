import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutAddressPage, AddressPayload } from '../pages/CheckoutAddressPage';

// ---------------------------------------------------------------------------
// Default address payload used for the EP-9 checkout address scenario.
// Values are realistic but do not rely on a real user account.
// ---------------------------------------------------------------------------
const DEFAULT_ADDRESS: AddressPayload = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle Gran Vía 1',
  city: 'Madrid',
  postalCode: '28013',
  countryCode: 'es',
  email: 'qa.checkout.ep9@example.com',
  phone: '+34600000001',
};

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Navigate to the storefront and find a stocked product to add to cart.
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

    // 2. Go to the cart page and proceed to checkout.
    const cart = new CartPage(this.page);
    await cart.open();
    // Click the checkout button rendered on the cart page.
    await this.page.getByTestId('checkout-button').click();
    await this.page.waitForLoadState('networkidle');

    // Store the checkout page reference for subsequent steps.
    this.data.checkoutAddressPage = new CheckoutAddressPage(this.page);
  },
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = this.data.checkoutAddressPage as CheckoutAddressPage;
    if (!checkout) throw new Error('CheckoutAddressPage not initialised in Given step');
    await checkout.fillAndSubmitAddress(DEFAULT_ADDRESS);
  },
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = this.data.checkoutAddressPage as CheckoutAddressPage;
    await checkout.expectAddressSaved();
  },
);

Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = this.data.checkoutAddressPage as CheckoutAddressPage;
    await checkout.expectToRemainOnAddressStep();
  },
);

// @EP-9
