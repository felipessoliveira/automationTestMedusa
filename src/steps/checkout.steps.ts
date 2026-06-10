import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { CheckoutPage } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

Given('the customer is on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
});

When('the customer fills and submits the address form with:', async function (this: CustomWorld, table: DataTable) {
  if (!this.page) throw new Error('UI page not initialized');
  const data = rowsToObject(table);
  const checkout = new CheckoutPage(this.page);
  
  await checkout.fillAddressDetails();
  await checkout.fillEmail(data.email);
  await checkout.fillPhone(data.phone);
  
  this.data.checkoutEmail = data.email;
  await checkout.submitAddress();
});

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const expectedEmail = this.data.checkoutEmail as string;
  const actualEmail = await checkout.getEmailValue();
  expect(actualEmail).toBe(expectedEmail);
});

Then('the customer remains on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const isOnAddressStep = await checkout.isOnAddressStep();
  expect(isOnAddressStep).toBe(true);
});

// @EP-9
