import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigates to the cart and then to the checkout address step.
   */
  async open(): Promise<void> {
    // Navigate to cart first to ensure we can click checkout
    await this.page.goto('/es/cart');
    await this.page.getByTestId('checkout-button').click();
  }

  /**
   * Fills in the shipping email and phone inputs.
   * Note: Billing address is handled via the 'same as shipping' checkbox logic
   * or implied by the form submission in this context.
   */
  async fillAddress(email: string, phone: string): Promise<void> {
    await this.page.getByTestId('shipping-email-input').fill(email);
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  /**
   * Submits the address form to proceed.
   */
  async submitAddress(): Promise<void> {
    await this.page.getByTestId('submit-address-button').click();
  }

  /**
   * Asserts that the current URL is the address step of the checkout.
   */
  expectOnAddressStep(): void {
    expect(this.page.url()).toContain('step=address');
  }
}

// @EP-9
