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
    // Wait for navigation to settle after form submission
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 });
  }

  /**
   * Assert the page URL remains within the checkout flow.
   * After a successful address save the app advances to step=delivery —
   * that is the expected, correct behaviour.  We only assert that we have
   * NOT been redirected outside the checkout flow entirely (e.g. back to
   * cart or to an error page).
   */
  async expectStillInCheckoutFlow(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 10_000 });
  }

  /** Assert the page URL is on the delivery step (address was accepted). */
  async expectOnDeliveryStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=delivery/, { timeout: 10_000 });
  }

  /** Assert the email input retains the submitted value (data saved). */
  async expectEmailSaved(email: string): Promise<void> {
    await expect(this.page.getByTestId('shipping-email-input')).toHaveValue(email);
  }
}

// @EP-9
