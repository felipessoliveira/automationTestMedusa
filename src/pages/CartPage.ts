import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByTestId('checkout-button');
  }

  async open() {
    await this.page.goto('/es/cart');
  }

  async clickCheckoutButton() {
    await this.checkoutButton.click();
  }
}

// @EP-9
