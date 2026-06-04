import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
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
    throw new Error('No products available on the storefront');
  }
  
  await home.openProductByHref(products[0].href);
  const pdp = new ProductPage(this.page);
  if (await pdp.canAddToCart()) {
    await pdp.addToCart();
  } else {
    throw new Error('The first listed product is not available to add to cart.');
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
  
  const shipping = { 
    email: 'test.customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001',
    phone: '5551234567'
  };
  
  const billing = {
    firstName: 'Jane',
    lastName: 'Doe',
    address: '456 Side Street',
    city: 'Brooklyn',
    postalCode: '11201',
    phone: '5557654321'
  };

  await checkout.enterShippingDetails(shipping);
  await checkout.enterBillingDetails(billing);
  await checkout.saveDetails();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectDetailsSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectUrlContains('/checkout');
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/checkout');
  expect(currentUrl).not.toContain('/payment');
  expect(currentUrl).not.toContain('/confirmed');
});

// @EP-9
