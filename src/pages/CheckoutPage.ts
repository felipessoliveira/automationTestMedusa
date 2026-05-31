import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAddress(address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  }): Promise<void> {
    await this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]').fill(address.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]').fill(address.lastName);
    await this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]').fill(address.address);
    await this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]').fill(address.city);
    await this.page.locator('[data-testid="shipping-postal-input"], input[name="shipping_address.postal_code"]').fill(address.postalCode);
    await this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]').selectOption({ label: address.country });
  }

  async saveShippingAddress(): Promise<void> {
    await this.page.locator('[data-testid="submit-shipping-address-button"], button:has-text("Save shipping"), button:has-text("Submit address")').click();
  }

  async enterBillingAddressAndEmail(email: string, address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  }): Promise<void> {
    await this.page.locator('[data-testid="billing-email-input"], input[name="email"]').fill(email);
    await this.page.locator('[data-testid="billing-first-name-input"], input[name="billing_address.first_name"]').fill(address.firstName);
    await this.page.locator('[data-testid="billing-last-name-input"], input[name="billing_address.last_name"]').fill(address.lastName);
    await this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]').fill(address.address);
    await this.page.locator('[data-testid="billing-city-input"], input[name="billing_address.city"]').fill(address.city);
    await this.page.locator('[data-testid="billing-postal-input"], input[name="billing_address.postal_code"]').fill(address.postalCode);
    await this.page.locator('[data-testid="billing-country-select"], select[name="billing_address.country_code"]').selectOption({ label: address.country });
  }

  async saveBillingAddressAndEmail(): Promise<void> {
    await this.page.locator('[data-testid="submit-billing-address-button"], button:has-text("Save billing"), button:has-text("Submit billing")').click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"], input[name="code"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")').click();
  }

  async expectShippingAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-address-summary"], .shipping-address-done')).toBeVisible();
  }

  async expectBillingAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="billing-address-summary"], .billing-address-done')).toBeVisible();
  }

  async expectPromoCodeApplied(): Promise<void> {
    await expect(this.page.locator('[data-testid="promo-code-tag"], [data-testid="discount-row"], .discount-applied')).toBeVisible();
  }

  async getDiscountAmount(): Promise<string> {
    return (await this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]').textContent()) || '';
  }
}
