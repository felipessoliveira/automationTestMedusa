import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async saveShippingAndBillingAddress(email: string, shipping: any, billing: any): Promise<void> {
    await this.page.locator('[data-testid="shipping-email-input"], input[name="email"]').fill(email);
    await this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]').fill(shipping.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]').fill(shipping.lastName);
    await this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]').fill(shipping.address);
    await this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]').fill(shipping.city);
    await this.page.locator('[data-testid="shipping-postal-input"], input[name="shipping_address.postal_code"]').fill(shipping.postalCode);
    await this.page.locator('[data-testid="submit-address-button"]').click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"], input[name="code"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"]').click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary"]')).toBeVisible();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator('[data-testid="applied-promo-code"]')).toContainText(code);
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-discount"]')).toBeVisible();
  }
}

// @EP-9
