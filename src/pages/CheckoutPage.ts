import { expect, type Page } from '@playwright/test';
import { config } from '../support/config';

export interface AddressPayload {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  /** ISO-2 country code, e.g. 'es' */
  countryCode: string;
  email: string;
  phone?: string;
}

/**
 * Page Object for the checkout address step.
 *
 * URL pattern: /{locale}/checkout?step=address
 *
 * Locators are sourced from the element catalog for
 * https://medusa-storefront-839705751382.europe-west1.run.app/es/checkout?step=address
 */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // ── Navigation ────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    const locale = config.locale ?? 'es';
    await this.page.goto(`/${locale}/checkout?step=address`);
    await this.page.waitForURL(`**/${locale}/checkout?step=address`, { timeout: 15_000 });
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  /**
   * Fill every required address field and click the submit button.
   * Uses test-id locators from the element catalog where available;
   * falls back to label-scoped role locators for fields without a test-id.
   */
  async fillAndSubmitAddress(payload: AddressPayload): Promise<void> {
    const { page } = this;

    // First name — label-scoped role locator (no test-id in catalog)
    await page
      .getByRole('textbox', { name: /first name/i })
      .fill(payload.firstName);

    // Last name
    await page
      .getByRole('textbox', { name: /last name/i })
      .fill(payload.lastName);

    // Email — test-id from element catalog (Element 22: shippingEmailInput)
    await page.getByTestId('shipping-email-input').fill(payload.email);

    // Phone — test-id from element catalog (Element 24: shippingPhoneInput)
    if (payload.phone) {
      await page.getByTestId('shipping-phone-input').fill(payload.phone);
    }

    // Address line 1
    await page
      .getByRole('textbox', { name: /address/i })
      .first()
      .fill(payload.address);

    // City
    await page
      .getByRole('textbox', { name: /city/i })
      .fill(payload.city);

    // Postal code
    await page
      .getByRole('textbox', { name: /postal|zip/i })
      .fill(payload.postalCode);

    // Country — select by value
    await page
      .getByRole('combobox', { name: /country/i })
      .selectOption(payload.countryCode);

    // Billing same as shipping checkbox is checked by default on most storefronts;
    // if the catalog element (Element 20: onInput) is visible we leave it checked
    // so that billing address mirrors shipping.

    // Submit — test-id from element catalog (Element 26: submitAddressButton)
    await page.getByTestId('submit-address-button').click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /**
   * Confirms that address details were persisted.
   * The submit button disappears / becomes disabled once the address is saved,
   * or the section collapses into a read-only summary.
   * We assert the button is no longer the active call-to-action, which is the
   * simplest stable signal available from the element catalog.
   */
  async expectAddressSaved(): Promise<void> {
    // After a successful save the submit button either disappears or is
    // replaced by an edit affordance.  We wait until it is detached / hidden.
    const submitBtn = this.page.getByTestId('submit-address-button');
    // Allow up to 10 s for the UI to acknowledge the save.
    await expect(submitBtn)
      .not.toBeVisible({ timeout: 10_000 })
      .catch(async () => {
        // Fallback: if the button is still visible it should at least be
        // disabled, meaning the form was accepted.
        await expect(submitBtn).toBeDisabled({ timeout: 5_000 });
      });
  }

  /**
   * Asserts the customer has NOT been redirected to the delivery step
   * or any other page.  The URL must still contain 'checkout' and must
   * NOT contain 'step=delivery'.
   */
  async expectNotRedirectedToDelivery(): Promise<void> {
    const url = this.page.url();
    expect(url).toContain('checkout');
    expect(url).not.toContain('step=delivery');
  }
}

// @EP-9
