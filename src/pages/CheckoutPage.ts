import { Page, expect } from '@playwright/test';
import { CartPage } from './CartPage';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigates to the checkout page starting from the cart page.
   * This ensures we enter via the 'Go to checkout' button flow.
   */
  async openFromCart() {
    const cart = new CartPage(this.page);
    await cart.open();
    // Assumes the cart page has a specific way to go to checkout, usually via a button or link
    // Using the locator found in the element catalog for the 'Go to checkout' button on the cart
    await this.page.getByTestId('checkout-button').click();
    // Verify we land on the address step
    await expect(this.page).toHaveURL(/.*checkout.*step=address/);
  }

  /**
   * Fills in the shipping email and phone inputs.
   * Also handles the billing address logic if it requires a specific checkbox.
   * Based on Element Catalog, we verify specific testids exist for inputs.
   */
  async fillShippingDetails(email: string, phone: string) {
    await this.page.getByTestId('shipping-email-input').fill(email);
    await this.page.getByTestId('shipping-phone-input').fill(phone);

    // Based on element catalog, billing address same as shipping is a checkbox
    // In some flows this is checked by default or requires interaction. We check it here to fulfill 'save billing address'.
    const sameAddressCheckbox = this.page.locator('.flex.items-center.space-x-2').getByRole('checkbox');
    await sameAddressCheckbox.check();
  }

  /**
   * Clicks the submit button to save the address.
   * In a correct flow, this might trigger a state change or redirect,
   * but this test is specifically checking that it *does not* redirect.
   */
  async submitAddress() {
    await this.page.getByTestId('submit-address-button').click();
  }

  /**
   * Verifies the current page is the checkout address step,
   * confirming no unintended navigation occurred.
   */
  async verifyOnAddressStep() {
    await expect(this.page).toHaveURL(/.*checkout.*step=address/);
  }
}

// @EP-9
