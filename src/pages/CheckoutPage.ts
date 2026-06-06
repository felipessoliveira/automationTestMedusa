import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async enterShippingDetails(details: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    countryCode?: string;
  }): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(details.email);
    await this.page.getByTestId('shipping-first-name-input').fill(details.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(details.lastName);
    
    const addressInput = this.page.getByTestId('shipping-address-1-input').or(this.page.getByTestId('shipping-address-input'));
    await addressInput.fill(details.address);

    await this.page.getByTestId('shipping-city-input').fill(details.city);
    
    const postalInput = this.page.getByTestId('shipping-postal-code-input').or(this.page.getByTestId('shipping-postal-input'));
    await postalInput.fill(details.postalCode);

    await this.page.getByTestId('shipping-phone-input').fill(details.phone);

    if (details.countryCode) {
      await this.page.getByTestId('shipping-country-select').selectOption(details.countryCode);
    }
  }

  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectAddressStepActive(): Promise<void> {
    await this.expectUrlContains('step=address');
  }
}

// @EP-9
