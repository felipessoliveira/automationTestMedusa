import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAndBilling(email: string): Promise<void> {
    await this.page.locator('input[name="email"], [data-testid="billing-email-input"]').first().fill(email);
    await this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]').first().fill('Felipe');
    await this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]').first().fill('Oliveira');
    await this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]').first().fill('123 Medusa Ave');
    await this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]').first().fill('New York');
    await this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]').first().fill('10001');
    await this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]').first().fill('1234567890');

    const billingCheckbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"]#billing-same-as-shipping');
    if (await billingCheckbox.isVisible()) {
      await billingCheckbox.check();
    }
  }

  async saveAddress(): Promise<void> {
    const saveBtn = this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")').first();
    await saveBtn.click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary"], [data-testid="shipping-address-completed-tick"], button:has-text("Edit address")').first()).toBeVisible();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-input"], input[name="code"]').fill(code);
    await this.page.locator('[data-testid="promo-submit-button"], button:has-text("Apply")').click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator('[data-testid="discount-code-badge"], :has-text("' + code + '")').first()).toBeVisible();
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.page.locator('[data-testid="discount-amount"], [data-testid="cart-discount"], :has-text("Discount")').first()).toBeVisible();
  }
}
