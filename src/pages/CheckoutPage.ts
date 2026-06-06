import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddress {
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

  private readonly firstName = () => this.page.getByTestId('shipping-first-name-input');
  private readonly lastName = () => this.page.getByTestId('shipping-last-name-input');
  private readonly address = () => this.page.getByTestId('shipping-address-input');
  private readonly postalCode = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly city = () => this.page.getByTestId('shipping-city-input');
  private readonly countrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly province = () => this.page.getByTestId('shipping-province-input');
  private readonly phone = () => this.page.getByTestId('shipping-phone-input');
  private readonly email = () => this.page.getByTestId('shipping-email-input');
  private readonly billingSameCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddress = () => this.page.getByTestId('submit-address-button');

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillAddress(data: CheckoutAddress): Promise<void> {
    await this.firstName().fill(data.first_name);
    await this.lastName().fill(data.last_name);
    await this.address().fill(data.address);
    await this.postalCode().fill(data.postal_code);
    await this.city().fill(data.city);
    await this.countrySelect().selectOption(data.country_code);
    if (data.province) await this.province().fill(data.province);
    if (data.phone) await this.phone().fill(data.phone);
    await this.email().fill(data.email);
  }

  // Ensure billing address is explicitly captured (uncheck "same as shipping" if checked).
  async useExplicitBillingAddress(): Promise<void> {
    const checkbox = this.billingSameCheckbox();
    const state = await checkbox.getAttribute('aria-checked').catch(() => null);
    if (state === 'true') {
      await checkbox.click();
    }
  }

  async saveAddress(): Promise<void> {
    await this.submitAddress().click();
  }

  async expectAddressSaved(data: CheckoutAddress): Promise<void> {
    await expect
      .poll(async () => (await this.firstName().inputValue().catch(() => '')) === data.first_name, {
        timeout: 15_000,
      })
      .toBeTruthy();
    await expect(this.email()).toHaveValue(data.email);
    await expect(this.city()).toHaveValue(data.city);
  }

  async expectOnAddressStep(): Promise<void> {
    await this.expectUrlContains('checkout');
    await this.expectUrlContains('step=address');
  }
}

// @EP-9
