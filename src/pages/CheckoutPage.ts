import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(`${config.baseUrl}/${config.locale}/checkout?step=address`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillAndSaveAddress(email: string): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(email);
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectEmailSaved(email: string): Promise<void> {
    await expect(this.page.getByTestId('shipping-email-input')).toHaveValue(email);
  }

  async expectOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\?step=address/);
  }
}

// @EP-9
