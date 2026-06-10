import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillAddressDetails(): Promise<void> {
    // Fill generic address fields using standard label locators since they are not in the test-id catalog
    await this.page.getByLabel('First name').fill('QA');
    await this.page.getByLabel('Last name').fill('Tester');
    await this.page.getByLabel('Address').fill('123 Test Street');
    await this.page.getByLabel('City').fill('Madrid');
    await this.page.getByLabel('Postal code').fill('28001');
    await this.page.getByLabel('Province').fill('Madrid');
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(email);
  }

  async fillPhone(phone: string): Promise<void> {
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  async getEmailValue(): Promise<string> {
    return this.page.getByTestId('shipping-email-input').inputValue();
  }

  async isOnAddressStep(): Promise<boolean> {
    return this.page.url().includes('step=address');
  }
}

// @EP-9
