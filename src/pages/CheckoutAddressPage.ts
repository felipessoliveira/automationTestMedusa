import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface AddressFixture {
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  shipping_country_code: string;
  shipping_phone: string;
  email: string;
}

export class CheckoutAddressPage {
  private readonly page: Page;
  private readonly checkoutAddressPath: string;

  constructor(page: Page) {
    this.page = page;
    this.checkoutAddressPath = `/${config.locale}/checkout?step=address`;
  }

  async open(): Promise<void> {
    await this.page.goto(this.checkoutAddressPath);
    await this.page.waitForURL(`**${this.checkoutAddressPath}`);
  }

  async fillAndSaveAddress(address: AddressFixture): Promise<void> {
    // Shipping email
    await this.page.getByTestId('shipping-email-input').fill(address.email);

    // Shipping phone
    await this.page.getByTestId('shipping-phone-input').fill(address.shipping_phone);

    // Shipping address fields — using stable test-id locators from the element catalog
    // where available, falling back to visible label text for fields without test-ids.
    await this.page.getByLabel('First name').first().fill(address.shipping_first_name);
    await this.page.getByLabel('Last name').first().fill(address.shipping_last_name);
    await this.page.getByLabel('Address').first().fill(address.shipping_address);
    await this.page.getByLabel('City').first().fill(address.shipping_city);
    await this.page.getByLabel('State / Province').first().fill(address.shipping_province);
    await this.page.getByLabel('Postal code').first().fill(address.shipping_postal_code);

    // Country select — select by value (country code)
    const countrySelect = this.page.locator('select[data-testid="shipping-country-select"]').first();
    const countrySelectExists = await countrySelect.count();
    if (countrySelectExists > 0) {
      await countrySelect.selectOption({ value: address.shipping_country_code });
    }

    // Submit the address form
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectStillOnAddressStep(): Promise<void> {
    // Assert the URL still contains the checkout address step (not redirected to delivery)
    await expect(this.page).toHaveURL(/checkout\?step=address/);
  }

  async expectAddressSaved(): Promise<void> {
    // After saving, the submit button should no longer be visible (form collapses)
    // or the shipping summary section becomes visible — we assert we are NOT on delivery step
    await this.expectStillOnAddressStep();
    // The submit address button should no longer be in an active/enabled submit state
    // (the form is submitted and the step is completed)
    const submitButton = this.page.getByTestId('submit-address-button');
    // It either disappears or becomes part of a completed/collapsed step
    const isVisible = await submitButton.isVisible().catch(() => false);
    if (isVisible) {
      // If still visible, it should be disabled (address step completed)
      await expect(submitButton).toBeDisabled();
    }
    // Verify email input value persisted
    // (form may be collapsed; only check if still visible)
    const emailInput = this.page.getByTestId('shipping-email-input');
    const emailVisible = await emailInput.isVisible().catch(() => false);
    if (emailVisible) {
      await expect(emailInput).not.toHaveValue('');
    }
  }
}

// @EP-9
