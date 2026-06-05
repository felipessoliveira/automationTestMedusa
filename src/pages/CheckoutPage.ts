import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressPayload {
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  phone?: string;
  email: string;
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

  async fillAndSaveAddress(payload: AddressPayload): Promise<void> {
    await this.firstNameInput().fill(payload.first_name);
    await this.lastNameInput().fill(payload.last_name);
    await this.addressInput().fill(payload.address);
    await this.postalCodeInput().fill(payload.postal_code);
    await this.cityInput().fill(payload.city);
    await this.countrySelect().selectOption(payload.country_code);
    if (payload.province) {
      await this.provinceInput().fill(payload.province);
    }
    if (payload.phone) {
      await this.phoneInput().fill(payload.phone);
    }
    await this.emailInput().fill(payload.email);

    // Keep billing address same as shipping (default checked) so a single
    // shipping form covers both billing and shipping per the scenario.
    const billing = this.billingSameCheckbox();
    if ((await billing.count()) > 0) {
      const state = await billing.getAttribute('aria-checked').catch(() => null);
      if (state === 'false') {
        await billing.click();
      }
    }

    await this.submitAddressButton().click();
  }

  async expectAddressSaved(payload: AddressPayload): Promise<void> {
    await expect
      .poll(async () => (await this.emailInput().inputValue().catch(() => '')) || '', {
        timeout: 15_000,
      })
      .toBe(payload.email);
    await expect.poll(async () => (await this.firstNameInput().inputValue().catch(() => '')) || '').toBe(
      payload.first_name,
    );
  }

  async expectStillOnAddressStep(): Promise<void> {
    await this.expectUrlContains('/checkout?step=address');
  }
}

// @EP-9
