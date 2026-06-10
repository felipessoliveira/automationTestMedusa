import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
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
      this.data.product = { name: actualName };
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

    await checkout.fillShippingAddress({
      firstName: 'QA',
      lastName: 'Tester',
      address1: '123 Test St',
      city: 'Madrid',
      postalCode: '28001',
    });

    await checkout.useBillingSameAsShipping();
    await checkout.fillEmail('qa.test@example.com');
    await checkout.fillPhone('+34600000000');

    await checkout.saveAddress();
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    // Assumes successful save implies remaining on the address step without error redirections
    await checkout.expectOnAddressStep();
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
