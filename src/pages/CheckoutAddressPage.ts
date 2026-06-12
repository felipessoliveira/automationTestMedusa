import { expect, Page } from '@playwright/test';
import { config } from '../support/config';

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

export class CheckoutAddressPage {
  constructor(private readonly page: Page) {}

  /** Navigate directly to the checkout address step. */
  async open(): Promise<void> {
    await this.page.goto(`/${config.locale}/checkout?step=address`);
  }

  /** Fill in shipping address fields, email, and optionally phone, then submit. */
  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    // Shipping address fields (standard Medusa checkout form test-ids)
    await this.page.getByTestId('shipping-first-name-input').fill(payload.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(payload.lastName);
    await this.page.getByTestId('shipping-address-input').fill(payload.address);
    await this.page.getByTestId('shipping-city-input').fill(payload.city);
    await this.page.getByTestId('shipping-postal-code-input').fill(payload.postalCode);
    // Country select (native select element on the form)
    await this.page.getByTestId('shipping-country-select').selectOption(payload.countryCode);

    // Email input — stable test-id from element catalog
    await this.page.getByTestId('shipping-email-input').fill(payload.email);

    if (payload.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(payload.phone);
    }

    // Billing same-as-shipping checkbox is checked by default; no extra action needed
    // unless the AC requires a distinct billing address (not the case for this scenario).

    // Submit — test-id from element catalog: submitAddressButton
    await this.page.getByTestId('submit-address-button').click();
  }

  /** Assert the page URL still contains step=address (no redirect to delivery or other step). */
  async expectRemainsOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=address/, { timeout: 10_000 });
  }

  /** Assert the email field retains the submitted value (address saved). */
  async expectEmailSaved(email: string): Promise<void> {
    // After saving, Medusa renders the address summary or keeps the field populated.
    // We confirm the email input still holds the supplied value.
    const emailInput = this.page.getByTestId('shipping-email-input');
    await expect(emailInput).toHaveValue(email, { timeout: 10_000 });
  }
}

// @EP-9
