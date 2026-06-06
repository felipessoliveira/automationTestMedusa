import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddress {
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country_code?: string;
  phone?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly container = () => this.page.getByTestId('checkout-container');
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
    await expect(this.container()).toBeVisible();
  }

  private async fillIfPresent(
    locatorFactory: () => ReturnType<Page['getByTestId']>,
    value?: string,
  ): Promise<void> {
    if (!value) return;
    const locator = locatorFactory();
    if (await locator.count()) {
      await locator.first().fill(value);
    }
  }

  async saveAddress(address: CheckoutAddress): Promise<void> {
    await this.fillIfPresent(this.firstNameInput, address.first_name);
    await this.fillIfPresent(this.lastNameInput, address.last_name);
    await this.fillIfPresent(this.addressInput, address.address);
    await this.fillIfPresent(this.postalCodeInput, address.postal_code);
    await this.fillIfPresent(this.cityInput, address.city);
    await this.fillIfPresent(this.provinceInput, address.province);
    await this.fillIfPresent(this.emailInput, address.email);
    await this.fillIfPresent(this.phoneInput, address.phone);

    if (address.country_code && (await this.countrySelect().count())) {
      await this.countrySelect().first().selectOption(address.country_code).catch(() => undefined);
    }

    // Keep billing same as shipping to satisfy the billing-address requirement.
    const checkbox = this.billingSameCheckbox();
    if (await checkbox.count()) {
      const checked = await checkbox.first().getAttribute('aria-checked');
      if (checked === 'false') {
        await checkbox.first().click();
      }
    }

    await this.submitAddressButton().first().click();
  }

  async expectAddressSaved(address: CheckoutAddress): Promise<void> {
    // Saved details are reflected as read-only summary text on the address step.
    await expect
      .poll(async () => {
        const body = (await this.container().textContent().catch(() => '')) ?? '';
        return body.includes(address.email) && body.includes(address.first_name);
      }, { timeout: 15_000 })
      .toBeTruthy();
  }

  async expectStillOnAddressStep(): Promise<void> {
    await expect(this.container()).toBeVisible();
    await this.expectUrlContains('/checkout');
    await expect(this.page).not.toHaveURL(/step=delivery/);
  }
}

// @EP-9
