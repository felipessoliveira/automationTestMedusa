import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage, CheckoutAddress } from '../pages/CheckoutPage';
import { rowsToObject } from './common.steps';

Given('I am on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
  await checkout.expectOnAddressStep();
});

When(
  'I save the checkout address using the {string} address template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const address = buildFixture<CheckoutAddress>('addresses', overrides, template);
    this.data.address = address;
    const checkout = new CheckoutPage(this.page);
    await checkout.fillAddress(address);
    await checkout.useExplicitBillingAddress();
    await checkout.saveAddress();
  },
);

Then('the checkout address and email details are saved', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const address = this.data.address as CheckoutAddress;
  if (!address) throw new Error('No checkout address was captured for the assertion.');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectAddressSaved(address);
});

Then('I remain on the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

// @EP-9
