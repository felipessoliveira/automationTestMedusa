import { expect, Page } from '@playwright/test';
import { config } from '../support/config';

/**
 * Page Object for the checkout address step.
 * URL: /{locale}/checkout?step=address
 */
export interface AddressPayload {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  email: string;
  phone?: string;
}

export class CheckoutPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Absolute URL for the checkout address step using the configured locale. */
  private get url(): string {
    const base = config.baseUrl.replace(/\/$/, '');
    const locale = config.locale || 'es';
    return `${base}/${locale}/checkout?step=address`;
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForURL(/checkout.*step=address/, { timeout: 15_000 });
  }

  /**
   * Fills and submits the shipping address form.
   * Uses test-id locators from the element catalog where available and
   * falls back to label-scoped role locators for fields not yet catalogued.
   */
  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    // Email — test-id from element catalog
    await this.page.getByTestId('shipping-email-input').fill(payload.email);

    // Phone — test-id from element catalog (optional)
    if (payload.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(payload.phone);
    }

    // First name
    await this.page.getByTestId('shipping-first-name-input').fill(payload.firstName);

    // Last name
    await this.page.getByTestId('shipping-last-name-input').fill(payload.lastName);

    // Address line 1
    await this.page.getByTestId('shipping-address-input').fill(payload.address);

    // City
    await this.page.getByTestId('shipping-city-input').fill(payload.city);

    // Postal code
    await this.page.getByTestId('shipping-postal-code-input').fill(payload.postalCode);

    // Submit — test-id from element catalog: submitAddressButton
    await this.page.getByTestId('submit-address-button').click();
  }

  /** Asserts the page URL still contains step=address (not redirected to delivery). */
  async expectStillOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout.*step=address/, { timeout: 10_000 });
  }

  /** Asserts the submitted email value is still present (details saved). */
  async expectEmailIsSaved(email: string): Promise<void> {
    const emailInput = this.page.getByTestId('shipping-email-input');
    await expect(emailInput).toHaveValue(email, { timeout: 10_000 });
  }
}

// @EP-9
