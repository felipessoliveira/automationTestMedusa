import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, AddressPayload } from '../pages/CheckoutPage';

Given('I proceed to the checkout address step', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const checkout = new CheckoutPage(this.page);
  await checkout.open();
  await checkout.expectOnAddressStep();
});

When(
  'I fill and save the shipping address, billing address, and email using the {string} address template',
  async function (this: CustomWorld, template: string) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const address = buildFixture<AddressPayload>('addresses', {}, template);
    this.data.address = address;

    const checkout = new CheckoutPage(this.page);
    await checkout.fillShippingAddress(address);
    await checkout.setBillingSameAsShipping();
    await checkout.saveAddress();
  },
);

Then('the address and email details are saved successfully', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  const address = this.data.address as AddressPayload;

  const firstNameInput = checkout.page.getByTestId('shipping-first-name-input');
  await expect(firstNameInput).toHaveValue(address.first_name || '');

  const emailInput = checkout.page.getByRole('textbox', { name: 'Enter a valid email address.' });
  await expect(emailInput).toHaveValue(address.email || '');
});

Then('I remain on the checkout address step without being redirected', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const checkout = new CheckoutPage(this.page);
  await checkout.expectOnAddressStep();
});

// @EP-9
