import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, ShippingAddressData } from '../pages/CheckoutPage';
import { config } from '../support/config';

// ── Default address used for the checkout address scenario ───────────────────
const DEFAULT_SHIPPING_ADDRESS: ShippingAddressData = {
  firstName: 'QA',
  lastName: 'Tester',
  address: 'Calle Gran Vía 1',
  city: 'Madrid',
  postalCode: '28013',
  countryCode: 'es',
  email: config.testUser.email,
  phone: '+34600000000',
};

// ── Given ────────────────────────────────────────────────────────────────────

Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Navigate to storefront and find a product to add to cart
    const home = new HomePage(this.page);
    await home.open();
    const products: ProductCandidate[] = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No products found on the storefront home page.');
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
        `No stocked product was available. Tried: ${attempted.join(', ')}`,
      );
    }

    // 2. Navigate to cart and proceed to checkout
    const cart = new CartPage(this.page);
    await cart.open();
    await this.page.getByTestId('checkout-button').click();

    // 3. Verify we land on the address step
    await this.page.waitForURL(/checkout.*step=address/, { timeout: 15_000 });

    this.data.checkoutAddress = DEFAULT_SHIPPING_ADDRESS;
  },
);

// ── When ─────────────────────────────────────────────────────────────────────

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const addressData = (this.data.checkoutAddress as ShippingAddressData) ?? DEFAULT_SHIPPING_ADDRESS;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSaveAddress(addressData);
  },
);

// ── Then ─────────────────────────────────────────────────────────────────────

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const addressData = (this.data.checkoutAddress as ShippingAddressData) ?? DEFAULT_SHIPPING_ADDRESS;
    const checkout = new CheckoutPage(this.page);
    await checkout.expectAddressSavedSuccessfully(addressData.email);
  },
);

Then(
  'the customer remains on the checkout address page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectRemainsOnAddressStep();
  },
);

// @EP-9
