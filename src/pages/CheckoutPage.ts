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
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone: string;
  }): Promise<void> {
    await this.page.locator('[data-testid="shipping-email-input"], input[name="email"]').fill(address.email);
    await this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]').fill(address.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]').fill(address.lastName);
    await this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]').fill(address.address);
    await this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]').fill(address.city);
    await this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]').fill(address.postalCode);
    await this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]').fill(address.phone);
  }

  async enterBillingAddress(address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  }): Promise<void> {
    const sameAddressCheckbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[name="same_as_shipping"]');
    if (await sameAddressCheckbox.isVisible()) {
      const isChecked = await sameAddressCheckbox.isChecked();
      if (isChecked) {
        await sameAddressCheckbox.uncheck();
      }
    }
    await this.page.locator('[data-testid="billing-first-name-input"], input[name="billing_address.first_name"]').fill(address.firstName);
    await this.page.locator('[data-testid="billing-last-name-input"], input[name="billing_address.last_name"]').fill(address.lastName);
    await this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]').fill(address.address);
    await this.page.locator('[data-testid="billing-city-input"], input[name="billing_address.city"]').fill(address.city);
    await this.page.locator('[data-testid="billing-postal-code-input"], input[name="billing_address.postal_code"]').fill(address.postalCode);
  }

  async saveAddress(): Promise<void> {
    await this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")').first().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const summary = this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-saved-indicator"]');
    await expect(summary.first().or(this.page.locator('button:has-text("Edit Address"), button:has-text("Edit")'))).toBeVisible();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"], input[name="code"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")').click();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const promoLabel = this.page.locator(`[data-testid="applied-promo-code"], :has-text("${code}")`);
    await expect(promoLabel.first()).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountLocator = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');
    await expect(discountLocator.first()).toBeVisible();
    const text = await discountLocator.first().textContent();
    expect(text).toMatch(/\d/);
  }
}

// @EP-9
