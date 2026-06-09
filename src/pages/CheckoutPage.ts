import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressPayload {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  country_code: string;
  province: string;
  postal_code: string;
  phone: string;
  email: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly checkoutContainer = () => this.page.getByTestId('checkout-container');
  private readonly shippingFirstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly shippingLastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly shippingAddress1Input = () => this.page.getByTestId('shipping-address-1-input');
  private readonly shippingCityInput = () => this.page.getByTestId('shipping-city-input');
  private readonly shippingCountrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly shippingProvinceInput = () => this.page.getByTestId('shipping-province-input');
  private readonly shippingPostalCodeInput = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly shippingPhoneInput = () => this.page.getByTestId('shipping-phone-input');
  private readonly shippingEmailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly billingAddressCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  async fillShippingAddress(address: AddressPayload): Promise<void> {
    await this.shippingFirstNameInput().fill(address.first_name);
    await this.shippingLastNameInput().fill(address.last_name);
    await this.shippingAddress1Input().fill(address.address_1);
    await this.shippingCityInput().fill(address.city);
    await this.shippingCountrySelect().selectOption(address.country_code);
    await this.shippingProvinceInput().fill(address.province);
    await this.shippingPostalCodeInput().fill(address.postal_code);
    await this.shippingPhoneInput().fill(address.phone);
    await this.shippingEmailInput().fill(address.email);
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

  async expectOnAddressStep(): Promise<void> {
    await expect(this.checkoutContainer()).toBeVisible();
    await this.expectUrlContains('checkout');
    await expect(this.page).not.toHaveURL(/step=delivery/);
  }

  async expectAddressSaved(): Promise<void> {
    await expect.poll(async () => {
      const firstName = await this.shippingFirstNameInput().inputValue();
      return firstName.length > 0;
    }, { timeout: 10_000 }).toBeTruthy();
  }
}

// @EP-9
