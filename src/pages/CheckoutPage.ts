import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAndBilling(
    email: string,
    address: {
      firstName: string;
      lastName: string;
      address1: string;
      city: string;
      postalCode: string;
      countryCode: string;
    },
  ): Promise<void> {
    await this.page.locator('[data-testid="shipping-email-input"]').fill(email);
    await this.page.locator('[data-testid="shipping-first-name-input"]').fill(address.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"]').fill(address.lastName);
    await this.page.locator('[data-testid="shipping-address-input"]').fill(address.address1);
    await this.page.locator('[data-testid="shipping-city-input"]').fill(address.city);
    await this.page.locator('[data-testid="shipping-postal-code-input"]').fill(address.postalCode);
    await this.page.locator('[data-testid="shipping-country-select"]').selectOption(address.countryCode);
    await this.page.locator('[data-testid="save-address-button"]').click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"]').click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary-section"]')).toBeVisible();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator('[data-testid="applied-promo-badge"]')).toContainText(code);
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountLocator = this.page.locator('[data-testid="cart-discount-amount"]');
    await expect(discountLocator).toBeVisible();
    const discountText = await discountLocator.textContent();
    expect(discountText).not.toBe('');
  }
}
