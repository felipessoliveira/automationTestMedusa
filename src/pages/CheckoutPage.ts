import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddress {
  first_name: string;
  last_name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country_code?: string;
  phone?: string;
  email: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly shippingFirstName = () => this.page.getByTestId('shipping-first-name-input');
  private readonly shippingLastName = () => this.page.getByTestId('shipping-last-name-input');
  private readonly shippingAddress = () => this.page.getByTestId('shipping-address-input');
  private readonly shippingPostalCode = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly shippingCity = () => this.page.getByTestId('shipping-city-input');
  private readonly shippingProvince = () => this.page.getByTestId('shipping-province-input');
  private readonly shippingCountrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly shippingPhone = () => this.page.getByTestId('shipping-phone-input');
  private readonly shippingEmail = () => this.page.getByTestId('shipping-email-input');
  private readonly billingSameCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');

  async openAddressStep(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async ensureBillingSameAsShipping(): Promise<void> {
    const checkbox = this.billingSameCheckbox();
    if ((await checkbox.count()) === 0) return;
    const checked = await checkbox.getAttribute('aria-checked').catch(() => null);
    if (checked === 'false') {
      await checkbox.click();
    }
  }

  async fillAndSaveAddress(address: CheckoutAddress): Promise<void> {
    await this.shippingFirstName().fill(address.first_name);
    await this.shippingLastName().fill(address.last_name);
    if (address.address) await this.shippingAddress().fill(address.address).catch(() => undefined);
    if (address.postal_code) await this.shippingPostalCode().fill(address.postal_code).catch(() => undefined);
    if (address.city) await this.shippingCity().fill(address.city).catch(() => undefined);
    if (address.province) await this.shippingProvince().fill(address.province).catch(() => undefined);
    if (address.country_code) await this.shippingCountrySelect().selectOption(address.country_code).catch(() => undefined);
    if (address.phone) await this.shippingPhone().fill(address.phone).catch(() => undefined);
    await this.shippingEmail().fill(address.email);

    // Billing same as shipping keeps billing address aligned without extra entry.
    await this.ensureBillingSameAsShipping();

    await this.submitAddressButton().click();
  }

  async expectAddressSaved(address: CheckoutAddress): Promise<void> {
    await expect
      .poll(async () => (await this.shippingFirstName().inputValue().catch(() => '')) === address.first_name, {
        timeout: 15_000,
      })
      .toBeTruthy();
    await expect(this.shippingLastName()).toHaveValue(address.last_name);
    await expect(this.shippingEmail()).toHaveValue(address.email);
  }

  async expectStillOnAddressStep(): Promise<void> {
    await this.expectUrlContains('/checkout');
    await this.expectUrlContains('step=address');
  }
}

// @EP-9
