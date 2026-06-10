import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly shippingEmailInput: Locator;
  readonly shippingPhoneInput: Locator;
  readonly submitAddressButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shippingEmailInput = page.getByTestId('shipping-email-input');
    this.shippingPhoneInput = page.getByTestId('shipping-phone-input');
    this.submitAddressButton = page.getByTestId('submit-address-button');
  }

  async open() {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillShippingDetails(email: string, phone: string) {
    await this.shippingEmailInput.fill(email);
    await this.shippingPhoneInput.fill(phone);
  }

  async submitAddress() {
    await this.submitAddressButton.click();
  }
}

// @EP-9
