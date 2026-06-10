import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(`${config.baseUrl}/${config.locale}/checkout?step=address`);
  }

  async fillAndSubmitAddress(details: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    postalCode: string;
  }): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(details.email);
    await this.page.getByTestId('shipping-phone-input').fill(details.phone);

    // Fallback to label-based locators for fields not explicitly in the element catalog snippet
    await this.page.getByLabel('First name').fill(details.firstName);
    await this.page.getByLabel('Last name').fill(details.lastName);
    await this.page.getByLabel('Address').fill(details.address1);
    await this.page.getByLabel('City').fill(details.city);
    await this.page.getByLabel('Postal code').fill(details.postalCode);

    // Submit the address form
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep(): Promise<void> {
    await this.page.waitForURL(/checkout\?step=address/);
    expect(this.page.url()).not.toContain('step=delivery');
    expect(this.page.url()).toContain('checkout');
  }
}

// @EP-9
