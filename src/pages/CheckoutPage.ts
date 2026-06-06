import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddressPayload {
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_1: string;
  shipping_city: string;
  shipping_country_code: string;
  shipping_province: string;
  shipping_postal_code: string;
  billing_address_same_as_shipping: string;
  email: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly checkoutContainer = () => this.page.getByTestId('checkout-container');
  private readonly shippingFirstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly shippingLastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly shippingAddress1Input = () => this.page.getByTestId('shipping-address-input');
  private readonly shippingCityInput = () => this.page.getByTestId('shipping-city-input');
  private readonly shippingCountrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly shippingProvinceInput = () => this.page.getByTestId('shipping-province-input');
  private readonly shippingPostalCodeInput = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly billingAddressCheckbox = () =>
    this.page.getByRole('checkbox', { name: 'Billing address same as shipping address' });
  private readonly shippingEmailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly submitAddressButton = () => this.page.getByTestId('submit-address-button');

  async openAddress(): Promise<void> {
    await this.goto('/checkout?step=address');
    await expect(this.checkoutContainer()).toBeVisible();
  }

  async saveAddress(payload: CheckoutAddressPayload): Promise<void> {
    await this.shippingFirstNameInput().fill(payload.shipping_first_name);
    await this.shippingLastNameInput().fill(payload.shipping_last_name);
    await this.shippingAddress1Input().fill(payload.shipping_address_1);
    await this.shippingCityInput().fill(payload.shipping_city);
    await this.shippingCountrySelect().selectOption(payload.shipping_country_code);
    await this.shippingProvinceInput().fill(payload.shipping_province);
    await this.shippingPostalCodeInput().fill(payload.shipping_postal_code);
    const isSameAsShipping = payload.billing_address_same_as_shipping.toLowerCase() === 'true';
    if (isSameAsShipping) {
      await this.billingAddressCheckbox().check();
    }
    await this.shippingEmailInput().fill(payload.email);
    await this.submitAddressButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.checkoutContainer()).toBeVisible();
    await expect(this.shippingEmailInput()).toHaveValue(/.+@.+/);
  }

  async expectStillOnAddressStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\?step=address/);
    await expect(this.submitAddressButton()).toBeVisible();
  }
}

// @EP-9
