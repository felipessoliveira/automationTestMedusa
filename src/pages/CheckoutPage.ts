import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillShippingAddress(address: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postal_code: string;
    country_code: string;
    phone: string;
    province?: string;
  }): Promise<void> {
    await this.page.getByTestId('shipping-first-name-input').fill(address.first_name);
    await this.page.getByTestId('shipping-last-name-input').fill(address.last_name);
    await this.page.locator('input[name*="address_1"]').first().fill(address.address_1);
    await this.page.getByTestId('shipping-city-input').fill(address.city);
    await this.page.getByTestId('shipping-country-select').selectOption(address.country_code);
    if (address.province) {
      await this.page.getByTestId('shipping-province-input').fill(address.province);
    }
    await this.page.locator('input[name*="postal_code"]').first().fill(address.postal_code);
    await this.page.getByTestId('shipping-phone-input').fill(address.phone);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(email);
  }

  async sameBillingAddress(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: 'Billing address same as shipping address' })
      .check();
  }

  async saveAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep(): Promise<void> {
    await this.expectUrlContains('/checkout?step=address');
  }

  async expectNoAddressErrors(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="error"], .text-ui-fg-error, [role="alert"]')
    ).toHaveCount(0);
  }
}

// @EP-9
