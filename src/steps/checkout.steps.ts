import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

interface ProductFixture {
  name?: string;
  variant: string;
  quantity: number;
}

interface AddressFixture {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone: string;
  email: string;
  province?: string;
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

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = buildFixture<AddressFixture>('addresses', {}, 'default');
  const checkout = new CheckoutPage(this.page);
  await checkout.fillShippingAddress(address);
  await checkout.fillEmail(address.email);
  await checkout.sameBillingAddress();
  await checkout.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectNoAddressErrors();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

// @EP-9
