import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAddress(first: string, last: string, address: string, city: string, postal: string, phone: string): Promise<void> {
    await this.page.locator('[data-testid="shipping-first-name-input"], #shipping-first_name, input[name*="first_name"]').first().fill(first);
    await this.page.locator('[data-testid="shipping-last-name-input"], #shipping-last_name, input[name*="last_name"]').first().fill(last);
    await this.page.locator('[data-testid="shipping-address-input"], #shipping-address, input[name*="address_1"]').first().fill(address);
    await this.page.locator('[data-testid="shipping-city-input"], #shipping-city, input[name*="city"]').first().fill(city);
    await this.page.locator('[data-testid="shipping-postal-code-input"], #shipping-postal_code, input[name*="postal_code"]').first().fill(postal);
    await this.page.locator('[data-testid="shipping-phone-input"], #shipping-phone, input[name*="phone"]').first().fill(phone);
  }

  async fillBillingAddress(first: string, last: string, address: string, city: string, postal: string): Promise<void> {
    const checkbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], #billing-same-as-shipping, input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.click();
      }
    }
    await this.page.locator('[data-testid="billing-first-name-input"], #billing-first_name').first().fill(first);
    await this.page.locator('[data-testid="billing-last-name-input"], #billing-last_name').first().fill(last);
    await this.page.locator('[data-testid="billing-address-input"], #billing-address').first().fill(address);
    await this.page.locator('[data-testid="billing-city-input"], #billing-city').first().fill(city);
    await this.page.locator('[data-testid="billing-postal-code-input"], #billing-postal_code').first().fill(postal);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator('[data-testid="shipping-email-input"], #shipping-email, input[type="email"]').first().fill(email);
  }

  async saveAddressDetails(): Promise<void> {
    await this.page.locator('[data-testid="save-address-button"], button:has-text("Save address"), button:has-text("Submit"), button[type="submit"]').first().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary"], .address-saved-indicator, button:has-text("Edit"), button:has-text("Delivery")').first()).toBeVisible({ timeout: 10000 });
  }

  async enterPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"], input[placeholder*="Promo"], input[placeholder*="Discount"], input[name*="promo"]').first().fill(code);
  }

  async applyPromoCode(): Promise<void> {
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply"), button:has-text("Submit")').first().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="applied-promo"], :has-text("${code}"), .applied-promo-tag`).first()).toBeVisible({ timeout: 10000 });
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-discount"], .discount-amount, :has-text("Discount"), :has-text("SAVE20")').first()).toBeVisible({ timeout: 10000 });
  }
}
