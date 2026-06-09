import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly shippingFirstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly shippingLastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly shippingEmailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly shippingPhoneInput = () => this.page.getByTestId('shipping-phone-input');
  private readonly shippingAddress1Input = () => this.page.getByTestId('shipping-address-1-input');
  private readonly shippingCityInput = () => this.page.getByTestId('shipping-city-input');
  private readonly shippingProvinceInput = () => this.page.getByTestId('shipping-province-input');
  private readonly shippingPostalCodeInput = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly shippingCountrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly billingAddressCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');
  private readonly checkoutContainer = () => this.page.getByTestId('checkout-container');

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillShippingAddress(address: AddressPayload): Promise<void> {
    await this.shippingFirstNameInput().fill(address.first_name);
    await this.shippingLastNameInput().fill(address.last_name);
    await this.shippingEmailInput().fill(address.email);
    if (address.phone) {
      await this.shippingPhoneInput().fill(address.phone);
    }
    if (address.address_1) {
      await this.shippingAddress1Input().fill(address.address_1);
    }
    if (address.city) {
      await this.shippingCityInput().fill(address.city);
    }
    if (address.province) {
      await this.shippingProvinceInput().fill(address.province);
    }
    if (address.postal_code) {
      await this.shippingPostalCodeInput().fill(address.postal_code);
    }
    if (address.country_code) {
      await this.shippingCountrySelect().selectOption(address.country_code);
    }
  }

  async checkBillingSameAsShipping(): Promise<void> {
    const isChecked = await this.billingAddressCheckbox().isChecked();
    if (!isChecked) {
      await this.billingAddressCheckbox().check();
    }
  }

  async saveAddress(): Promise<void> {
    await this.submitAddressButton().click();
  }

  async expectOnCheckoutPage(): Promise<void> {
    await expect(this.checkoutContainer()).toBeVisible();
  }

  async expectUrlContainsAddressStep(): Promise<void> {
    await this.expectUrlContains('checkout');
  }

  async expectAddressSaved(firstName: string, lastName: string, email: string): Promise<void> {
    await expect(this.shippingFirstNameInput()).toHaveValue(firstName);
    await expect(this.shippingLastNameInput()).toHaveValue(lastName);
    await expect(this.shippingEmailInput()).toHaveValue(email);
  }
}

// @EP-9
