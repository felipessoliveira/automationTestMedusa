import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillEmail(email: string) {
    await this.page.getByTestId('shipping-email-input').fill(email);
  }

  async fillPhone(phone: string) {
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  async fillShippingAddress(address: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    postalCode: string;
  }) {
    await this.page.getByLabel('First name').fill(address.firstName);
    await this.page.getByLabel('Last name').fill(address.lastName);
    await this.page.getByLabel('Address').fill(address.address1);
    await this.page.getByLabel('City').fill(address.city);
    await this.page.getByLabel('Postal code').fill(address.postalCode);
  }

  async useBillingSameAsShipping() {
    const checkbox = this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async saveAddress() {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep() {
    await expect(this.page).toHaveURL(/step=address/);
  }
}

// @EP-9
