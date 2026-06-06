import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  email: string;
  phone?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators sourced from the Element catalog for /checkout?step=address
  private readonly firstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly lastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly addressInput = () => this.page.getByTestId('shipping-address-input');
  private readonly postalCodeInput = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly cityInput = () => this.page.getByTestId('shipping-city-input');
  private readonly countrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly provinceInput = () => this.page.getByTestId('shipping-province-input');
  private readonly emailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly phoneInput = () => this.page.getByTestId('shipping-phone-input');
  private readonly billingSameAsShippingCheckbox = () =>
    this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');

  async openAddressStep(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillAndSaveAddress(address: ShippingAddress): Promise<void> {
    await this.firstNameInput().fill(address.first_name);
    await this.lastNameInput().fill(address.last_name);
    await this.addressInput().fill(address.address_1);
    await this.postalCodeInput().fill(address.postal_code);
    await this.cityInput().fill(address.city);
    await this.countrySelect().selectOption(address.country_code);

    if (address.province) {
      await this.provinceInput().fill(address.province);
    }

    // Keep billing address same as shipping (checkbox is checked by default).
    const checkbox = this.billingSameAsShippingCheckbox();
    const state = await checkbox.getAttribute('aria-checked').catch(() => null);
    if (state === 'false') {
      await checkbox.click();
    }

    await this.emailInput().fill(address.email);

    if (address.phone) {
      await this.phoneInput().fill(address.phone);
    }

    await this.submitAddressButton().click();
  }

  async expectAddressSaved(address: ShippingAddress): Promise<void> {
    await expect
      .poll(async () => (await this.emailInput().inputValue().catch(() => '')) === address.email, {
        timeout: 15_000,
      })
      .toBeTruthy();
    await expect(this.firstNameInput()).toHaveValue(address.first_name);
    await expect(this.lastNameInput()).toHaveValue(address.last_name);
  }

  async expectStillOnCheckoutAddressStep(): Promise<void> {
    await this.expectUrlContains('/checkout');
    await expect(this.submitAddressButton()).toBeVisible();
  }
}

// @EP-9
