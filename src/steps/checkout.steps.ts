import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';

Given('a customer has items in their cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const home = new HomePage(this.page);
  await home.open();
  const products = await home.listProducts();
  if (products.length === 0) throw new Error('No products found');
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  await pdp.addToCart();
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.saveShippingAndBillingAddress(
    'test@example.com',
    { firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Miami', postalCode: '33101' },
    { firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Miami', postalCode: '33101' }
  );
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectUrlContains('/checkout');
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.saveShippingAndBillingAddress(
    'test@example.com',
    { firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Miami', postalCode: '33101' },
    { firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Miami', postalCode: '33101' }
  );
  await checkout.expectAddressSaved();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.applyPromoCode(code);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectPromoApplied(code);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectTotalsRefreshed();
});

// @EP-9
