import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillShippingEmail(email: string) {
    await this.page.getByTestId('shipping-email-input').fill(email);
  }

  async fillShippingPhone(phone: string) {
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  async checkBillingSameAsShipping() {
    // Element 21: billingAddressSameAsShippingAddress
    await this.page
      .locator('.flex.items-center.space-x-2')
      .locator('.font-sans.txt-compact-large.font-normal')
      .click();
  }

  async clickSubmit() {
    // Element 26: submitAddressButton
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnCheckoutPage() {
    await expect(this.page).toHaveURL(/\/checkout/);
  }
}

// @EP-9
