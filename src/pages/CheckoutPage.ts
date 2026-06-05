import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillAddressDetails(details: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    countryCode: string;
    province: string;
    phone: string;
  }) {
    await this.page.getByTestId('shipping-email-input').fill(details.email);
    await this.page.getByTestId('shipping-first-name-input').fill(details.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(details.lastName);
    await this.page.getByTestId('shipping-address-input').fill(details.address);
    await this.page.getByTestId('shipping-postal-code-input').fill('12345');
    await this.page.getByTestId('shipping-city-input').fill(details.city);
    await this.page.getByTestId('shipping-country-select').selectOption(details.countryCode);
    await this.page.getByTestId('shipping-province-input').fill(details.province);
    await this.page.getByTestId('shipping-phone-input').fill(details.phone);
  }

  async checkBillingSameAsShipping() {
    const checkbox = this.page.getByTestId('billing-address-checkbox');
    const isChecked = await checkbox.getAttribute('aria-checked');
    if (isChecked !== 'true') {
      await checkbox.click();
    }
  }

  async submitAddress() {
    await this.page.getByTestId('submit-address-button').click();
  }
}

// @EP-9
