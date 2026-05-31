import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';

Given('a customer has items in the cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  
  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();
  if (products.length === 0) {
    throw new Error('No product links were discovered on the storefront.');
  }
  
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  await pdp.addToCart();
});

Given('the customer is on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.open();
});

When('the customer enters the required shipping address information', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.enterShippingAddress();
});

When('saves the shipping address on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.saveShippingAddress();
});

Then('the shipping address is saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.expectShippingAddressSaved();
});

Then('the customer remains on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.expectOnCartPage();
});

Then('the customer is not redirected to checkout', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.expectOnCartPage();
  const currentUrl = this.page.url();
  if (currentUrl.includes('/checkout')) {
    throw new Error('Customer was redirected to checkout!');
  }
});

When('the customer enters the required billing address information', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.enterBillingAddress();
});

When('enters the email address', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.enterEmailAddress('test@example.com');
});

When('saves the billing address and email on the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.saveBillingAddressAndEmail();
});

Then('the billing address and email are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cart = new CartPage(this.page);
  await cart.expectBillingAddressAndEmailSaved();
});
