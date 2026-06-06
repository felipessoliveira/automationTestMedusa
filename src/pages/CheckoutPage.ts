import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddressPayload {
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  phone?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly firstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly lastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly addressInput = () => this.page.getByTestId('shipping-address-input');
  private readonly postalCodeInput = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly cityInput = () => this.page.getByTestId('shipping-city-input');
  private readonly countrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly provinceInput = () => this.page.getByTestId('shipping-province-input');
  private readonly emailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly phoneInput = () => this.page.getByTestId('shipping-phone-input');
  private readonly billingSameCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');

  async openAddressStep(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillAddress(payload: CheckoutAddressPayload): Promise<void> {
    await this.firstNameInput().fill(payload.first_name);
    await this.lastNameInput().fill(payload.last_name);
    await this.addressInput().fill(payload.address);
    await this.postalCodeInput().fill(payload.postal_code);
    await this.cityInput().fill(payload.city);
    await this.countrySelect().selectOption(payload.country_code);
    if (payload.province) {
      await this.provinceInput().fill(payload.province);
    }
    await this.emailInput().fill(payload.email);
    if (payload.phone) {
      await this.phoneInput().fill(payload.phone);
    }
  }

  // Ensures billing address mirrors shipping so a single save persists both.
  async ensureBillingSameAsShipping(): Promise<void> {
    const checkbox = this.billingSameCheckbox();
    const state = await checkbox.getAttribute('aria-checked').catch(() => null);
    if (state === 'false') {
      await checkbox.click();
    }
  }

  async save(): Promise<void> {
    await this.submitAddressButton().click();
  }

  async expectAddressSaved(payload: CheckoutAddressPayload): Promise<void> {
    await expect.poll(async () => (await this.emailInput().inputValue().catch(() => '')), {
      timeout: 15_000,
    }).toBe(payload.email);
    await expect(this.firstNameInput()).toHaveValue(payload.first_name);
    await expect(this.lastNameInput()).toHaveValue(payload.last_name);
  }

  async expectStillOnCheckoutWithoutDelivery(): Promise<void> {
    await this.expectUrlContains('/checkout');
    await expect(this.page).not.toHaveURL(/step=delivery/);
  }
}

// @EP-9
