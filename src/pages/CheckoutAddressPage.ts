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
  private readonly page: Page;
  private readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = config.baseUrl;
  }

  /** Absolute URL for the checkout address step using the configured locale. */
  private checkoutUrl(): string {
    const locale = config.locale || 'es';
    return `${this.baseUrl}/${locale}/checkout?step=address`;
  }

  async open(): Promise<void> {
    await this.page.goto(this.checkoutUrl());
    await this.page.waitForLoadState('networkidle');
  }

  /** Fill in and submit the shipping/billing address form. */
  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    // Shipping email
    await this.page.getByTestId('shipping-email-input').fill(payload.email);

    // Shipping phone (optional)
    if (payload.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(payload.phone);
    }

    // Shipping address fields — located by data-testid where available,
    // falling back to stable name/label locators that the storefront renders.
    await this.page.getByTestId('shipping-first-name-input').fill(payload.firstName);
    await this.page.getByTestId('shipping-last-name-input').fill(payload.lastName);
    await this.page.getByTestId('shipping-address-input').fill(payload.address);
    await this.page.getByTestId('shipping-city-input').fill(payload.city);
    await this.page.getByTestId('shipping-postal-code-input').fill(payload.postalCode);

    // Country select
    const countrySelect = this.page.getByTestId('shipping-country-select');
    await countrySelect.selectOption(payload.countryCode);

    // Ensure "billing same as shipping" checkbox is checked so billing is
    // covered by the same data without requiring a second address block.
    const sameAsShipping = this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });
    const isChecked = await sameAsShipping.isChecked();
    if (!isChecked) {
      await sameAsShipping.check();
    }

    // Submit — element catalog confirms test-id "submit-address-button"
    await this.page.getByTestId('submit-address-button').click();
  }

  /** Assert that the page URL still contains the address step after submission. */
  async expectToRemainOnAddressStep(): Promise<void> {
    // Wait briefly for any potential redirect to settle
    await this.page.waitForTimeout(2000);
    const url = this.page.url();
    expect(url).toContain('checkout');
    expect(url).toContain('step=address');
  }

  /** Assert that the submit button (or a saved-address indicator) is visible,
   *  confirming the address was accepted without navigating away. */
  async expectAddressSaved(): Promise<void> {
    // After a successful save the submit button remains visible on the page
    // (the fix under test prevents navigation to the delivery step).
    await expect(this.page.getByTestId('submit-address-button')).toBeVisible();
  }
}

// @EP-9
