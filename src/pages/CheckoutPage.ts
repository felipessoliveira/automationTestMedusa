import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string): Promise<void> {
    await this.page.locator('input[name="email"], [data-testid="shipping-email-input"]').first().fill(email);
    await this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').first().fill('Felipe');
    await this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').first().fill('Oliveira');
    await this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').first().fill('123 Test St');
    await this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').first().fill('Boston');
    await this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code-input"]').first().fill('02111');
    
    const billingCheckbox = this.page.locator('[data-testid="billing-address-checkbox"], input[type="checkbox"]').first();
    if (await billingCheckbox.isVisible()) {
      await billingCheckbox.check();
    }

    const saveBtn = this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")').first();
    await saveBtn.click();
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    const promoInput = this.page.locator('input[name="code"], [data-testid="promo-code-input"], [data-testid="discount-input"]').first();
    await promoInput.fill(code);
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")').first().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const addressSummary = this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"]').first();
    await expect(addressSummary).toBeVisible();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const promoCodeBadge = this.page.locator(`[data-testid="discount-badge"], :has-text("${code}")`).first();
    await expect(promoCodeBadge).toBeVisible();
  }

  async expectCartTotalsRefreshed(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]').first();
    await expect(discountAmount).toBeVisible();
  }
}