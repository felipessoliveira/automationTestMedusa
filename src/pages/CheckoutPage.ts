import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillContactInfo(email: string, phone: string): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(email);
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  async fillShippingAddress(firstName: string, lastName: string): Promise<void> {
    const form = this.page.locator('form');
    await form.getByLabel('First name').fill(firstName);
    await form.getByLabel('Last name').fill(lastName);
    await form.getByLabel('Address').fill('Calle Test 123');
    await form.getByLabel('City').fill('Madrid');
    await form.getByLabel('Postal code').fill('28001');
  }

  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=address/);
  }

  async expectEmailSaved(email: string): Promise<void> {
    await expect(this.page.getByTestId('shipping-email-input')).toHaveValue(email);
  }
}

// @EP-9
