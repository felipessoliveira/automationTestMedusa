import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface AddressPayload {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  email: string;
}

export class CheckoutAddressPage {
  private readonly page: Page;

  // Absolute URL built from baseUrl + locale, matching the repository's baseURL pattern.
  private get url(): string {
    return `${config.baseUrl}/${config.locale}/checkout?step=address`;
  }

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Fill in the shipping address form fields and submit. */
  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    // Shipping address fields — using test-id locators from the element catalog where available.
    await this.page.getByTestId('shipping-first-name-input').fill(payload.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(payload.lastName);
    await this.page.getByTestId('shipping-address-input').fill(payload.address);
    await this.page.getByTestId('shipping-city-input').fill(payload.city);
    await this.page.getByTestId('shipping-postal-code-input').fill(payload.postalCode);

    // Country select — locate by test-id pattern used across the catalog.
    const countrySelect = this.page.getByTestId('shipping-country-select');
    if (await countrySelect.count() > 0) {
      await countrySelect.selectOption(payload.countryCode);
    }

    // Email — test-id confirmed in element catalog (Element 22: shippingEmailInput).
    await this.page.getByTestId('shipping-email-input').fill(payload.email);

    // Submit — test-id confirmed in element catalog (Element 26: submitAddressButton).
    await this.page.getByTestId('submit-address-button').click();
  }

  /** Assert the page URL still contains step=address (not redirected). */
  async expectStillOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout\?step=address/, { timeout: 10_000 });
  }

  /** Assert the submitted email value is retained on the page (visible in a field or summary). */
  async expectEmailVisible(email: string): Promise<void> {
    // After a successful save the email input should retain the submitted value.
    const emailInput = this.page.getByTestId('shipping-email-input');
    await expect(emailInput).toHaveValue(email, { timeout: 10_000 });
  }
}

// @EP-9
