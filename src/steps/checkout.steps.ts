import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
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

  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);

  if (await pdp.canAddToCart()) {
    await pdp.addToCart();
  } else {
    throw new Error('Initial product found was out of stock.');
  }
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);

  const uniqueEmail = `qa.checkout.${Date.now()}@example.com`;
  this.data.checkoutEmail = uniqueEmail;

  await checkoutPage.enterShippingDetails(
    uniqueEmail,
    'Felipe',
    'Oliveira',
    '123 Main Street',
    'San Francisco',
    '94111',
    '+15555555555'
  );
  await checkoutPage.checkSameAsBilling();
  await checkoutPage.saveAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectAddressSaved();
  if (this.data.checkoutEmail) {
    await checkoutPage.expectEmailSaved(this.data.checkoutEmail);
  }
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectUrlContains('/checkout');
});

// @EP-9
