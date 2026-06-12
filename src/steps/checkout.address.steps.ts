import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutAddressPage, AddressPayload } from '../pages/CheckoutAddressPage';
import { config } from '../support/config';

// ---------------------------------------------------------------------------
// Default test address used for the EP-9 checkout address scenario.
// All values are generic enough to pass storefront validation.
// ---------------------------------------------------------------------------
const DEFAULT_ADDRESS: AddressPayload = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle Gran Via 1',
  city: 'Madrid',
  postalCode: '28013',
  countryCode: 'es',
  email: config.testUser.email,
  phone: '+34600000000',
};

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Land on the storefront and find a stocked product.
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
        const actualName = await pdp.getTitle().catch(() => candidate.name);
        await pdp.addToCart();
        this.data.product = { name: actualName };
        added = true;
        break;
      }

      await home.open();
    }

    if (!added) {
      throw new Error('No stocked product was available to add to cart.');
    }

    // 2. Navigate to cart and proceed to checkout.
    const cart = new CartPage(this.page);
    await cart.open();
    // Click the checkout button/link that takes us to the address step.
    await this.page.getByTestId('checkout-button').click();
    await this.page.waitForLoadState('networkidle');
  },
);

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkoutAddress = new CheckoutAddressPage(this.page);
    // billingAddressSameAsShipping = true covers saving billing implicitly.
    await checkoutAddress.fillAndSaveAddress(DEFAULT_ADDRESS, true);
    // Persist the used address for assertion steps.
    this.data.checkoutAddress = DEFAULT_ADDRESS;
  },
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkoutAddress = new CheckoutAddressPage(this.page);
    await checkoutAddress.expectAddressSavedSuccessfully();
  },
);

Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkoutAddress = new CheckoutAddressPage(this.page);
    await checkoutAddress.expectToRemainOnAddressStep();
  },
);

// @EP-9
