import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutAddressPage, AddressFixture } from '../pages/CheckoutAddressPage';
import { config } from '../support/config';

Given(
  'a customer has items in their cart and is on the checkout page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    // 1. Open storefront and find a stocked product to add to cart
    const home = new HomePage(this.page);
    await home.open();
    const products = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    const attempted: string[] = [];
    let added = false;

    for (const candidate of products as ProductCandidate[]) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);

      if (await pdp.canAddToCart()) {
        const actualName = await pdp.getTitle().catch(() => candidate.name);
        await pdp.addToCart();
        this.data.product = { name: actualName };
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

    // 2. Navigate to the checkout address page
    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.open();
  },
);

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const address = buildFixture<AddressFixture>('addresses', {}, 'default');
    this.data.address = address;

    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.fillAndSaveAddress(address);
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectAddressSaved();
  },
);

Then(
  'the customer remains on the checkout page without being redirected',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const checkoutPage = new CheckoutAddressPage(this.page);
    await checkoutPage.expectStillOnAddressStep();
  },
);

// @EP-9
