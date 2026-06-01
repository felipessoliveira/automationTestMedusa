import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBilling(
    email: string,
    firstName: string,
    lastName: string,
    address: string,
    city: string,
    postalCode: string,
    country: string
  ) {
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="shipping_address.first_name"]').fill(firstName);
    await this.page.locator('input[name="shipping_address.last_name"]').fill(lastName);
    await this.page.locator('input[name="shipping_address.address_1"]').fill(address);
    await this.page.locator('input[name="shipping_address.city"]').fill(city);
    await this.page.locator('input[name="shipping_address.postal_code"]').fill(postalCode);
    
    const billingCheckbox = this.page.locator('input[name="same_as_shipping"]');
    if (await billingCheckbox.isVisible()) {
      await billingCheckbox.check();
    }
  }

  async saveAddress(): Promise<void> {
    await this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Proceed")').first().click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('input[name="code"], [data-testid="promo-input"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")').click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="applied-promo"], :has-text("${code}")`).first()).toBeVisible();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary"], :has-text("Saved")').first()).toBeVisible();
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.page.locator('[data-testid="discount-amount"], :has-text("Discount")').first()).toBeVisible();
  }
}
