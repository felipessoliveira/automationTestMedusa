import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  email: string;
  phone?: string;
}

export class CheckoutAddressPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate directly to the checkout address step for the configured locale. */
  async open(): Promise<void> {
    const locale = config.locale ?? 'es';
    await this.page.goto(`/${locale}/checkout?step=address`);
    await this.page.waitForLoadState('networkidle');
  }

  /** Fill in all shipping address fields plus the email field. */
  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    await this.page.getByTestId('shipping-first-name-input').fill(address.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(address.lastName);
    await this.page.getByTestId('shipping-address-input').fill(address.address);
    await this.page.getByTestId('shipping-postal-code-input').fill(address.postalCode);
    await this.page.getByTestId('shipping-city-input').fill(address.city);
    // Country selector — select by value (ISO-2 code)
    await this.page.getByTestId('shipping-country-select').selectOption(address.countryCode);
    await this.page.getByTestId('shipping-email-input').fill(address.email);
    if (address.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(address.phone);
    }
  }

  /** Submit the address form via the "Continue to delivery" button. */
  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
    // Wait briefly for any potential navigation or network activity to settle
    await this.page.waitForTimeout(2000);
  }

  /** Assert the page URL still contains step=address (no redirect happened). */
  async expectStillOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=address/);
  }

  /** Assert the email input retains the submitted value (data saved). */
  async expectEmailSaved(email: string): Promise<void> {
    await expect(this.page.getByTestId('shipping-email-input')).toHaveValue(email);
  }
}

// @EP-9
