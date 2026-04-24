import { When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { rowsToObject } from './common.steps';

interface ProductFixture {
  name?: string;
  variant: string;
  quantity: number;
}

When(
  'I add a product to the cart using the {string} product template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const product = buildFixture<ProductFixture>('products', overrides, template);

    const home = new HomePage(this.page);
    await home.open();
    const products = await home.listProducts();

    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    const preferred = product.name
      ? products.filter((candidate) => candidate.name.toLowerCase().includes(product.name!.toLowerCase()))
      : [];
    const remaining = products.filter(
      (candidate) => !preferred.some((match) => match.href === candidate.href),
    );
    const orderedCandidates: ProductCandidate[] = [...preferred, ...remaining];
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

Then('the cart page shows that product with the template quantity', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const product = this.data.product as ProductFixture;
  if (!product.name) throw new Error('No product name was captured for the cart assertion.');
  const cart = new CartPage(this.page);
  await cart.open();
  await cart.expectItem(product.name, product.quantity);
});
