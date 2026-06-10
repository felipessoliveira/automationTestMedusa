import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { faker } from '@faker-js/faker';

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
    throw new Error('First available product is out of stock.');
  }
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.fillAndSubmitAddress({
    email: faker.internet.email(),
    phone: faker.phone.number('+346#######'),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    address1: faker.location.streetAddress(),
    city: faker.location.city(),
    postalCode: faker.location.zipCode(),
  });
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  // Wait for network activity to settle to ensure the save request completes
  await this.page.waitForLoadState('networkidle');
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

// @EP-9
