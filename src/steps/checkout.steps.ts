import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { rowsToObject } from './common.steps';
import { CheckoutPage, CheckoutAddressPayload } from '../pages/CheckoutPage';

Given('I open the checkout address page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.openAddress();
});

When('I save the checkout address with:', async function (this: CustomWorld, table: DataTable) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const overrides = rowsToObject(table);
  const payload = {
    shipping_first_name: overrides.shipping_first_name,
    shipping_last_name: overrides.shipping_last_name,
    shipping_address_1: overrides.shipping_address_1,
    shipping_city: overrides.shipping_city,
    shipping_country_code: overrides.shipping_country_code,
    shipping_province: overrides.shipping_province,
    shipping_postal_code: overrides.shipping_postal_code,
    billing_address_same_as_shipping: overrides.billing_address_same_as_shipping,
    email: overrides.email,
  } as CheckoutAddressPayload;

  this.data.checkoutAddress = payload;
  const checkout = new CheckoutPage(this.page);
  await checkout.saveAddress(payload);
});

Then('the checkout address is saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved();
});

Then('I remain on the checkout page without redirecting to delivery or another page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectStillOnAddressStep();
  await expect(this.page).toHaveURL(/\/checkout\?step=address/);
});

// @EP-9
