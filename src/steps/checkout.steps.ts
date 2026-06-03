import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const testEmail = process.env.TEST_USER_EMAIL || 'qa.test@example.com';

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
  await this.page.waitForLoadState('networkidle').catch(() => {});
  if (await pdp.canAddToCart()) {
    await pdp.addToCart();
    await this.page.waitForTimeout(3000);
  } else {
    const addToCartBtn = this.page.locator('[data-testid="add-product-button"], button:has-text("Add to cart"), button:has-text("Agregar al carrito"), button:has-text("Añadir al carrito")');
    if (await addToCartBtn.first().isVisible()) {
      await addToCartBtn.first().click();
      await this.page.waitForTimeout(3000);
    } else {
      throw new Error('Could not add the first product to cart.');
    }
  }
});

Given('the customer is on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.open();
});

When('the customer enters and saves their shipping address, billing address, and email', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillEmail(testEmail);
  await checkoutPage.fillShippingAddress({
    firstName: 'Felipe',
    lastName: 'Oliveira',
    address: '123 Medusa Street',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    phone: '1234567890'
  });
  await checkoutPage.fillBillingAddress({
    firstName: 'Felipe',
    lastName: 'Oliveira',
    address: '123 Medusa Street',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    phone: '1234567890'
  });
  await checkoutPage.saveDetails();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectDetailsSaved();
});

Then('the customer remains on the checkout page without being redirected to the delivery step or any other page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectNotRedirectedToDelivery();
});

Given('the customer has saved their shipping address, billing address, and email on the checkout page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.fillEmail(testEmail);
  await checkoutPage.fillShippingAddress({
    firstName: 'Felipe',
    lastName: 'Oliveira',
    address: '123 Medusa Street',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    phone: '1234567890'
  });
  await checkoutPage.fillBillingAddress({
    firstName: 'Felipe',
    lastName: 'Oliveira',
    address: '123 Medusa Street',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    phone: '1234567890'
  });
  await checkoutPage.saveDetails();
  await checkoutPage.expectDetailsSaved();
});

When('the customer enters and applies a valid promo code {string}', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.applyPromoCode(code);
});

Then('the promo code {string} is applied successfully', async function (this: CustomWorld, code: string) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectPromoApplied(code);
});

Then('the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.expectTotalsRefreshedWithDiscount();
});