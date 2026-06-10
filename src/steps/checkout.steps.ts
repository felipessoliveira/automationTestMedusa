import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

interface ProductFixture {
  name?: string;
  variant: string;
  quantity: number;
}

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const product = buildFixture<ProductFixture>('products', {}, 'default');

  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();

  if (products.length === 0) {
    throw new Error('No product links were discovered on the storefront.');
  }

  for (const candidate of products) {
    await home.openProductByHref(candidate.href);
    const pdp = new ProductPage(this.page);

    if (await pdp.canAddToCart()) {
      const actualName = await pdp.getTitle().catch(() => candidate.name);
      await pdp.addToCart();
      this.data.product = { ...product, name: actualName };
      return;
    }
    await home.open();
  }

  throw new Error('No stocked product was available to add to cart.');
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSaveAddress({
      firstName: 'QA',
      lastName: 'Tester',
      address1: '123 Test St',
      city: 'Madrid',
      postalCode: '28001',
      countryCode: 'ES',
      email: 'qa.tester@example.com',
      phone: '+34600000000',
    });
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectAddressSaved();
  },
);

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.expectOnAddressStep();
  },
);

// @EP-9
