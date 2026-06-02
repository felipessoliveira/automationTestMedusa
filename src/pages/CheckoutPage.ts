import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string, address: { firstName: string; lastName: string; address1: string; city: string; postalCode: string; phone: string }): Promise<void> {
    await this.page.locator('input[name="email"], [data-testid="shipping-email-input"]').fill(email);
    await this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').fill(address.firstName);
    await this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').fill(address.lastName);
    await this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').fill(address.address1);
    await this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').fill(address.city);
    await this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-input"]').fill(address.postalCode);
    await this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone-input"]').fill(address.phone);
  }

  async saveAddress(): Promise<void> {
    await this.page.locator('button:has-text("Save"), [data-testid="submit-address-button"]').first().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"], button:has-text("Edit")').first()).toBeVisible();
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    await this.page.locator('input[name="code"], [data-testid="promo-input"]').fill(code);
    await this.page.locator('button:has-text("Apply"), [data-testid="apply-promo-button"]').first().click();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="applied-promo"], :has-text("${code}")`).first()).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]').first()).toBeVisible();
  }
}