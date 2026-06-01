import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(
    email: string,
    firstName: string,
    lastName: string,
    address: string,
    city: string,
    postalCode: string
  ): Promise<void> {
    await this.page.locator('input[name="email"], [data-testid="shipping-email-input"]').fill(email);
    await this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').fill(firstName);
    await this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').fill(lastName);
    await this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').fill(address);
    await this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').fill(city);
    await this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code-input"]').fill(postalCode);
    
    const billingCheckbox = this.page.locator('input[type="checkbox"]#billing-same-as-shipping, [data-testid="billing-same-as-shipping-checkbox"]');
    if (await billingCheckbox.isVisible()) {
      await billingCheckbox.check();
    }
  }

  async saveAddress(): Promise<void> {
    await this.page.locator('button:has-text("Save"), button:has-text("Submit"), [data-testid="submit-address-button"]').click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-address-summary"], .address-summary-section')).toBeVisible();
  }

  async expectOnCheckoutPageWithoutRedirect(): Promise<void> {
    await this.expectUrlContains('/checkout');
    await expect(this.page.locator('[data-testid="checkout-container"], .checkout-layout')).toBeVisible();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('input[name="code"], [data-testid="promo-code-input"]').fill(code);
    await this.page.locator('button:has-text("Apply"), [data-testid="apply-promo-button"]').click();
  }

  async expectPromoCodeApplied(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="applied-promo-code"], :has-text("${code}")`).first()).toBeVisible();
  }

  async expectTotalsRefreshed(): Promise<void> {
    const discountLocator = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], .discount-line');
    await expect(discountLocator).toBeVisible();
    const text = await discountLocator.textContent();
    expect(text).toMatch(/-\s?\d+/);
  }
}
