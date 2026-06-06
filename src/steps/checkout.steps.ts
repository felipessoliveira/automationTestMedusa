import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage, CheckoutAddress } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

interface ProductFixture {
  name?: string;
  variant: string;
  quantity: number;
}

Given(
  'I have a product in the cart using the {string} product template',
  async function (this: CustomWorld, template: string) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const product = buildFixture<ProductFixture>('products', {}, template);

    const home = new HomePage(this.page);
    await home.open();
    const products = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    const orderedCandidates: ProductCandidate[] = [...products];
    const attempted: string[] = [];

    for (const candidate of orderedCandidates) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);

      if (await pdp.canAddToCart()) {
        const actualName = await pdp.getTitle().catch(() => candidate.name);
        await pdp.addToCart();
        this.data.product = { ...product, name: actualName };
        return;
      }

      attempted.push(candidate.name);
      await home.open();
    }

    throw new Error(
      `No stocked product was available to add to cart. Tried: ${attempted.join(', ')}`,
    );
  },
);

Given('I am on the checkout address page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.openAddressStep();
});

When(
  'I save the checkout address using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const address = buildFixture<CheckoutAddress>('addresses', overrides, template);
    this.data.address = address;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAndSaveAddress(address);
  },
);

Then('the checkout address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = this.data.address as CheckoutAddress;
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(address);
});

Then('I remain on the checkout address page without being redirected to delivery', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectStillOnAddressStep();
});

// @EP-9
