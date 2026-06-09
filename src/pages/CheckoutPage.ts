import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressPayload {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  city?: string;
  country_code?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=address/);
  }

  async fillShippingAddress(address: AddressPayload): Promise<void> {
    if (address.first_name) await this.page.getByTestId('shipping-first-name-input').fill(address.first_name);
    if (address.last_name) await this.page.getByTestId('shipping-last-name-input').fill(address.last_name);
    if (address.address_1) await this.page.getByTestId('shipping-address-input').fill(address.address_1);
    if (address.city) await this.page.getByTestId('shipping-city-input').fill(address.city);
    if (address.postal_code) await this.page.getByTestId('shipping-postal-code-input').fill(address.postal_code);
    if (address.phone) await this.page.getByTestId('shipping-phone-input').fill(address.phone);
    if (address.email) await this.page.getByRole('textbox', { name: 'Enter a valid email address.' }).fill(address.email);

    if (address.country_code) {
      await this.page.getByTestId('shipping-country-select').selectOption(address.country_code);
    }

    if (address.province) {
      const provinceInput = this.page.getByTestId('shipping-province-input');
      if (await provinceInput.isVisible()) {
        await provinceInput.fill(address.province);
      }
    }
  }

  async setBillingSameAsShipping(): Promise<void> {
    const checkbox = this.page.getByTestId('billing-address-checkbox');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
  }

  async saveAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }
}

// @EP-9
