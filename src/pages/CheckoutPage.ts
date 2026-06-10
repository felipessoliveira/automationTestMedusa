import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface AddressPayload {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  postalCode: string;
  countryCode: string;
  email: string;
  phone: string;
}

export class CheckoutPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto(`${config.baseUrl}/${config.locale}/checkout?step=address`);
  }

  async fillAndSaveAddress(address: AddressPayload): Promise<void> {
    await this.page.getByLabel('First name').fill(address.firstName);
    await this.page.getByLabel('Last name').fill(address.lastName);
    await this.page.getByLabel('Address').fill(address.address1);
    await this.page.getByLabel('City').fill(address.city);
    await this.page.getByLabel('Postal code').fill(address.postalCode);
    await this.page.getByLabel('Country').selectOption(address.countryCode);

    await this.page.getByTestId('shipping-email-input').fill(address.email);
    await this.page.getByTestId('shipping-phone-input').fill(address.phone);

    const sameAsShippingCheckbox = this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });
    await sameAsShippingCheckbox.check();

    await this.page.getByTestId('submit-address-button').click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.getByTestId('shipping-email-input')).toHaveValue(
      'qa.tester@example.com',
    );
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\?step=address/);
    await expect(this.page.getByTestId('submit-address-button')).toBeVisible();
  }
}

// @EP-9
