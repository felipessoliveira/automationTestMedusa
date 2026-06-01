import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAddress(details: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) {
    await this.page.locator('[data-testid="shipping-email-input"]').fill(details.email);
    await this.page.locator('[data-testid="shipping-first-name-input"]').fill(details.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"]').fill(details.lastName);
    await this.page.locator('[data-testid="shipping-address-input"]').fill(details.address);
    await this.page.locator('[data-testid="shipping-city-input"]').fill(details.city);
    await this.page.locator('[data-testid="shipping-postal-code-input"]').fill(details.postalCode);
    await this.page.locator('[data-testid="shipping-country-select"]').selectOption({ label: details.country });
  }

  async enterBillingAddress(details: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) {
    const billingCheckbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"]');
    if (await billingCheckbox.isVisible()) {
      await billingCheckbox.uncheck();
    }
    await this.page.locator('[data-testid="billing-first-name-input"]').fill(details.firstName);
    await this.page.locator('[data-testid="billing-last-name-input"]').fill(details.lastName);
    await this.page.locator('[data-testid="billing-address-input"]').fill(details.address);
    await this.page.locator('[data-testid="billing-city-input"]').fill(details.city);
    await this.page.locator('[data-testid="billing-postal-code-input"]').fill(details.postalCode);
  }

  async saveAddress() {
    await this.page.locator('[data-testid="save-address-button"]').click();
  }

  async expectAddressSavedSuccessfully() {
    await expect(this.page.locator('[data-testid="address-saved-success-badge"]')).toBeVisible();
  }

  async applyPromoCode(code: string) {
    await this.page.locator('[data-testid="promo-code-input"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"]').click();
  }

  async expectPromoAppliedSuccessfully(code: string) {
    await expect(this.page.locator('[data-testid="applied-promo-code"]')).toContainText(code);
  }

  async getCartTotal(): Promise<string> {
    const totalText = await this.page.locator('[data-testid="cart-total"]').textContent();
    return totalText?.trim() || '';
  }

  async getDiscountAmount(): Promise<string> {
    const discountText = await this.page.locator('[data-testid="discount-amount"]').textContent();
    return discountText?.trim() || '';
  }
}