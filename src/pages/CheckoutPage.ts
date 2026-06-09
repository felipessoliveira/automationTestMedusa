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
  }): Promise<void> {
    await this.page.locator('.flex.relative.z-0').getByTestId('shipping-first-name-input').fill(address.first_name);
    await this.page.locator('.flex.relative.z-0').getByTestId('shipping-last-name-input').fill(address.last_name);
    await this.page.locator('.flex.relative.z-0').getByTestId('shipping-city-input').fill(address.city);
    await this.page.locator('.relative.flex.items-center').getByTestId('shipping-country-select').selectOption(address.country);
    if (address.province) {
      await this.page.locator('.flex.relative.z-0').getByTestId('shipping-province-input').fill(address.province);
    }
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator('.flex.relative.z-0').getByRole('textbox', { name: 'Enter a valid email address.' }).fill(email);
  }

  async checkBillingSameAsShipping(): Promise<void> {
    await this.page.locator('.flex.items-center.space-x-2').getByRole('checkbox', { name: 'Billing address same as shipping address' }).check();
  }

  async submitAddress(): Promise<void> {
    await this.page.locator('.pb-8').getByRole('button', { name: 'Continue to delivery' }).click();
  }

  getFirstNameInput() {
    return this.page.locator('.flex.relative.z-0').getByTestId('shipping-first-name-input');
  }

  getLastNameInput() {
    return this.page.locator('.flex.relative.z-0').getByTestId('shipping-last-name-input');
  }

  getEmailInput() {
    return this.page.locator('.flex.relative.z-0').getByRole('textbox', { name: 'Enter a valid email address.' });
  }
}

// @EP-9
