import { When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { rowsToObject } from './common.steps';

interface ProductFixture {
  name: string;
  variant: string;
  quantity: number;
}

When(
  'I add a product to the cart using the {string} product template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const product = buildFixture<ProductFixture>('products', overrides, template);
    this.data.product = product;

    const home = new HomePage(this.page);
    await home.openProductByName(product.name);
    const pdp = new ProductPage(this.page);
    await pdp.addToCart();
  },
);

Then('the cart page shows that product with the template quantity', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const product = this.data.product as ProductFixture;
  const cart = new CartPage(this.page);
  await cart.open();
  await cart.expectItem(product.name, product.quantity);
});
