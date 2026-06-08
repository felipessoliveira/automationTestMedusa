import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAddress(address: {
    first_name: string;
    last_name: string;
    city: string;
    country: string;
    province?: string;
    email: string;
  }): Promise<void> {
    await this.page.getByTestId('shipping-first-name-input').fill(address.first_name);
    await this.page.getByTestId('shipping-last-name-input').fill(address.last_name);
    await this.page.getByTestId('shipping-city-input').fill(address.city);
    await this.page.getByTestId('shipping-country-select').selectOption(address.country);
    if (address.province) {
      await this.page.getByTestId('shipping-province-input').fill(address.province);
    }
    await this.page.getByTestId('shipping-email-input').fill(address.email);
  }

  async checkBillingSameAsShipping(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: 'Billing address same as shipping address' })
      .check();
  }

  async submitAddress(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue to delivery' }).click();
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.page).not.toHaveURL(/step=delivery/);
  }
}

// @EP-9
