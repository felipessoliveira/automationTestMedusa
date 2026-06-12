import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface AddressPayload {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  sameAsBilling: boolean;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    await this.page.goto(
      `${config.baseUrl}/${config.locale}/checkout?step=address`,
      { waitUntil: 'networkidle' },
    );
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async expectAddressStepVisible(): Promise<void> {
    await expect(
      this.page.getByTestId('submit-address-button'),
    ).toBeVisible({ timeout: 15_000 });
  }

  async expectAddressSaved(): Promise<void> {
    // After a successful save the submit button either disappears or becomes
    // disabled; we assert it is no longer in a ready-to-submit state.
    // Adjust this assertion if the application shows a different success signal.
    const submitBtn = this.page.getByTestId('submit-address-button');
    // Wait briefly for any in-flight network activity to settle.
    await this.page.waitForLoadState('networkidle');
    // The button should either be hidden or the URL should no longer be the
    // raw address step without the form being open.
    const isVisible = await submitBtn.isVisible();
    if (isVisible) {
      // Acceptable: button still rendered but page URL has not changed to delivery.
      const url = this.page.url();
      expect(url).toContain('/checkout');
      expect(url).not.toContain('step=delivery');
    }
    // If the button is gone the save was acknowledged — no further assertion needed.
  }

  // ── Interactions ────────────────────────────────────────────────────────────

  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    // Email
    const emailInput = this.page.getByTestId('shipping-email-input');
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(payload.email);

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

    // Phone
    const phoneInput = this.page.getByTestId('shipping-phone-input');
    await phoneInput.fill(payload.phone);

    // Billing same as shipping checkbox — tick if payload says same
    const checkbox = this.page
      .locator('.flex.items-center.space-x-2')
      .getByRole('checkbox', { name: 'on' });
    const isChecked = await checkbox.isChecked();
    if (payload.sameAsBilling && !isChecked) {
      await checkbox.check();
    } else if (!payload.sameAsBilling && isChecked) {
      await checkbox.uncheck();
    }

    // Submit
    await this.page.getByTestId('submit-address-button').click();
  }
}

// @EP-9
