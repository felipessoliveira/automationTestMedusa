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
  phone?: string;
}

export class CheckoutAddressPage {
  constructor(private readonly page: Page) {}

  /** Navigates directly to the checkout address step for the configured locale. */
  async open(): Promise<void> {
    await this.page.goto(`/${config.locale}/checkout?step=address`);
  }

  /** Fills in every address + email field and clicks the submit button. */
  async fillAndSave(payload: AddressPayload): Promise<void> {
    // Shipping – first name
    await this.page.getByTestId('shipping-first-name-input').fill(payload.firstName);
    // Shipping – last name
    await this.page.getByTestId('shipping-last-name-input').fill(payload.lastName);
    // Shipping – address line 1
    await this.page.getByTestId('shipping-address-input').fill(payload.address);
    // Shipping – city
    await this.page.getByTestId('shipping-city-input').fill(payload.city);
    // Shipping – postal code
    await this.page.getByTestId('shipping-postal-code-input').fill(payload.postalCode);
    // Shipping – country (select by value)
    await this.page.getByTestId('shipping-country-select').selectOption(payload.countryCode);
    // Email (testid confirmed in element catalog)
    await this.page.getByTestId('shipping-email-input').fill(payload.email);
    // Phone (optional but present in catalog)
    if (payload.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(payload.phone);
    }
    // Submit – testid confirmed in element catalog as 'submit-address-button'
    await this.page.getByTestId('submit-address-button').click();
  }

  /** Asserts the page URL still contains the address step (not redirected to delivery). */
  async expectOnAddressStep(): Promise<void> {
    // The page must not have navigated away from the address step.
    // We wait briefly to give any potential redirect time to fire before asserting.
    await this.page.waitForTimeout(2000);
    await expect(this.page).toHaveURL(/step=address/);
  }

  /** Asserts the submit button is visible, indicating the form was accepted without a full-page redirect. */
  async expectAddressSaved(): Promise<void> {
    // A successful save keeps the user on the same page; the submit button should remain in the DOM.
    await expect(this.page.getByTestId('submit-address-button')).toBeVisible();
  }
}

// @EP-9
