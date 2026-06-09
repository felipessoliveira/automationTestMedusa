import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressPayload {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  country_code: string;
  province?: string;
  postal_code: string;
  phone?: string;
  email: string;
  same_billing: boolean;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillShippingAddress(address: AddressPayload): Promise<void> {
    await this.page.getByTestId('shipping-first-name-input').fill(address.first_name);
    await this.page.getByTestId('shipping-last-name-input').fill(address.last_name);
    await this.page.getByTestId('shipping-address-1-input').fill(address.address_1);
    await this.page.getByTestId('shipping-city-input').fill(address.city);
    await this.page.getByTestId('shipping-country-select').selectOption(address.country_code);
    if (address.province) {
      await this.page.getByTestId('shipping-province-input').fill(address.province);
    }
    await this.page.getByTestId('shipping-postal-code-input').fill(address.postal_code);
    if (address.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(address.phone);
    }
    await this.page.getByTestId('shipping-email-input').fill(address.email);
  }

  async setBillingSameAsShipping(same: boolean): Promise<void> {
    const checkbox = this.page.getByTestId('billing-address-checkbox');
    const isChecked = await checkbox.isChecked();
    if (same && !isChecked) {
      await checkbox.check();
    } else if (!same && isChecked) {
      await checkbox.uncheck();
    }
  }

  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout\?step=address/);
  }

  async expectCheckoutContainerVisible(): Promise<void> {
    await expect(this.page.getByTestId('checkout-container')).toBeVisible();
  }

  async expectFieldValue(testId: string, value: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toHaveValue(value);
  }
}

// @EP-9
