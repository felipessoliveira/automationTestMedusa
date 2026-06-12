import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
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

/**
 * Page Object for the checkout address step.
 * URL pattern: /{locale}/checkout?step=address
 */
export class CheckoutAddressPage {
  private readonly page: Page;
  private readonly locale: string;

  constructor(page: Page) {
    this.page = page;
    this.locale = config.locale ?? 'es';
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  url(): string {
    return `/${this.locale}/checkout?step=address`;
  }

  async open(): Promise<void> {
    await this.page.goto(this.url());
    await this.page.waitForLoadState('networkidle');
  }

  // ── Locators (from Element Catalog) ──────────────────────────────────────

  private shippingFirstNameInput() {
    return this.page.getByTestId('shipping-first-name-input');
  }

  private shippingLastNameInput() {
    return this.page.getByTestId('shipping-last-name-input');
  }

  private shippingAddressInput() {
    return this.page.getByTestId('shipping-address-input');
  }

  private shippingCityInput() {
    return this.page.getByTestId('shipping-city-input');
  }

  private shippingPostalCodeInput() {
    return this.page.getByTestId('shipping-postal-code-input');
  }

  private shippingCountrySelect() {
    return this.page.getByTestId('shipping-country-select');
  }

  private shippingEmailInput() {
    // Element catalog: getByTestId('shipping-email-input')
    return this.page.getByTestId('shipping-email-input');
  }

  private shippingPhoneInput() {
    // Element catalog: getByTestId('shipping-phone-input')
    return this.page.getByTestId('shipping-phone-input');
  }

  private billingAddressSameAsShippingCheckbox() {
    // Element catalog: locator('.flex.items-center.space-x-2').getByRole('checkbox', { name: 'on' })
    return this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });
  }

  private submitAddressButton() {
    // Element catalog: getByTestId('submit-address-button')
    return this.page.getByTestId('submit-address-button');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fill shipping + billing address fields and submit.
   * When billingAddressSameAsShipping is true (default) the checkbox is left
   * checked so the billing section is skipped, satisfying "billing address
   * saved" implicitly via the same-as-shipping toggle.
   */
  async fillAndSaveAddress(payload: AddressPayload, billingAddressSameAsShipping = true): Promise<void> {
    // Shipping address fields
    const firstNameInput = this.shippingFirstNameInput();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(payload.firstName);
    }

    const lastNameInput = this.shippingLastNameInput();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(payload.lastName);
    }

    const addressInput = this.shippingAddressInput();
    if (await addressInput.isVisible()) {
      await addressInput.fill(payload.address);
    }

    const cityInput = this.shippingCityInput();
    if (await cityInput.isVisible()) {
      await cityInput.fill(payload.city);
    }

    const postalInput = this.shippingPostalCodeInput();
    if (await postalInput.isVisible()) {
      await postalInput.fill(payload.postalCode);
    }

    const countrySelect = this.shippingCountrySelect();
    if (await countrySelect.isVisible()) {
      await countrySelect.selectOption(payload.countryCode);
    }

    // Email (element catalog test-id)
    await this.shippingEmailInput().fill(payload.email);

    // Phone (optional)
    if (payload.phone) {
      const phoneInput = this.shippingPhoneInput();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill(payload.phone);
      }
    }

    // Billing same-as-shipping toggle
    const checkbox = this.billingAddressSameAsShippingCheckbox();
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (billingAddressSameAsShipping && !isChecked) {
        await checkbox.check();
      } else if (!billingAddressSameAsShipping && isChecked) {
        await checkbox.uncheck();
      }
    }

    // Submit
    await this.submitAddressButton().click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /** Verify the page URL is still the checkout address step (not redirected). */
  async expectToRemainOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout.*step=address/, { timeout: 10_000 });
  }

  /** The submit button should no longer be visible (form collapsed) OR the
   *  page URL still contains step=address — either condition proves no full
   *  redirect happened away from checkout. We assert URL first (most reliable). */
  async expectAddressSavedSuccessfully(): Promise<void> {
    // After saving, the address accordion collapses; the submit button disappears.
    // We wait briefly for any network activity to settle before asserting.
    await this.page.waitForLoadState('networkidle');
    // The URL must still be the checkout page (not delivery or any other page).
    await expect(this.page).toHaveURL(/\/checkout/, { timeout: 10_000 });
    // The submit button should be gone (section collapsed) which confirms save.
    await expect(this.submitAddressButton()).toBeHidden({ timeout: 10_000 });
  }
}

// @EP-9
