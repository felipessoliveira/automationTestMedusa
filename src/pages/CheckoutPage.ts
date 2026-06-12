import { expect, Page } from '@playwright/test';
import { config } from '../support/config';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  email: string;
}

/**
 * Page Object for the checkout address step.
 * URL pattern: /{locale}/checkout?step=address
 */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    const locale = config.locale;
    await this.page.goto(`/${locale}/checkout?step=address`);
  }

  // ── Address form helpers ─────────────────────────────────────────────────────

  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    await this.page.getByTestId('shipping-first-name-input').fill(address.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(address.lastName);
    await this.page.getByTestId('shipping-address-input').fill(address.address);
    await this.page.getByTestId('shipping-city-input').fill(address.city);
    await this.page.getByTestId('shipping-postal-code-input').fill(address.postalCode);
    // Country selector may be a native select or a custom component; try select first
    const countrySelect = this.page.getByTestId('shipping-country-select');
    if (await countrySelect.count() > 0) {
      await countrySelect.selectOption(address.countryCode);
    }
    await this.page.getByTestId('shipping-email-input').fill(address.email);
  }

  /** Unchecks "billing same as shipping" and fills the billing address fields. */
  async fillBillingAddress(address: ShippingAddress): Promise<void> {
    const sameAsShippingCheckbox = this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });

    // If the checkbox is checked, uncheck it to reveal the billing fields
    if (await sameAsShippingCheckbox.isChecked()) {
      await sameAsShippingCheckbox.uncheck();
    }

    await this.page.getByTestId('billing-first-name-input').fill(address.firstName);
    await this.page.getByTestId('billing-last-name-input').fill(address.lastName);
    await this.page.getByTestId('billing-address-input').fill(address.address);
    await this.page.getByTestId('billing-city-input').fill(address.city);
    await this.page.getByTestId('billing-postal-code-input').fill(address.postalCode);
    const billingCountrySelect = this.page.getByTestId('billing-country-select');
    if (await billingCountrySelect.count() > 0) {
      await billingCountrySelect.selectOption(address.countryCode);
    }
  }

  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  /** Asserts the submit button is visible, confirming we are still on the address step. */
  async expectAddressStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('submit-address-button')).toBeVisible();
  }

  /**
   * After saving the address the page should NOT navigate away to
   * /checkout?step=delivery or any other step – the URL must still
   * contain `step=address`.
   */
  async expectRemainsOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/step=address/);
  }

  /**
   * Verifies that the email value entered is reflected on the page
   * (the input retains its value after save).
   */
  async expectEmailSaved(email: string): Promise<void> {
    const emailInput = this.page.getByTestId('shipping-email-input');
    await expect(emailInput).toHaveValue(email);
  }
}

// @EP-9
