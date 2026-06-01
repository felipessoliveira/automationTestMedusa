import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingBillingAndEmail(email: string, shippingAddress: AddressInfo, billingAddress?: AddressInfo) {
    await this.page.locator('[data-testid="shipping-email-input"]').fill(email);
    
    await this.page.locator('[data-testid="shipping-first-name-input"]').fill(shippingAddress.firstName);
    await this.page.locator('[data-testid="shipping-last-name-input"]').fill(shippingAddress.lastName);
    await this.page.locator('[data-testid="shipping-address-input"]').fill(shippingAddress.address);
    await this.page.locator('[data-testid="shipping-city-input"]').fill(shippingAddress.city);
    await this.page.locator('[data-testid="shipping-postal-code-input"]').fill(shippingAddress.postalCode);
    await this.page.locator('[data-testid="shipping-country-select"]').selectOption(shippingAddress.countryCode);
    
    const sameAsShipping = await this.page.locator('[data-testid="billing-same-as-shipping-checkbox"]').isChecked().catch(() => true);
    if (!sameAsShipping) {
      await this.page.locator('[data-testid="billing-same-as-shipping-checkbox"]').check();
    }
  }

  async saveAddress() {
    await this.page.locator('[data-testid="submit-address-button"]').click();
  }

  async expectAddressSavedSuccessfully() {
    await expect(this.page.locator('[data-testid="address-summary"]')).toBeVisible();
  }

  async expectOnCheckoutPage() {
    await this.expectUrlContains('/checkout');
    // Verify URL does not redirect away or append next step suffixes like '/delivery'
    await expect(this.page).toHaveURL(/.*\/checkout$/);
  }

  async applyPromoCode(code: string) {
    await this.page.locator('[data-testid="promo-code-input"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"]').click();
  }

  async expectPromoCodeApplied(code: string) {
    await expect(this.page.locator('[data-testid="applied-promo-code"]')).toContainText(code);
  }

  async expectTotalsRefreshed() {
    await expect(this.page.locator('[data-testid="cart-discount-amount"]')).toBeVisible();
    const discountText = await this.page.locator('[data-testid="cart-discount-amount"]').textContent();
    expect(discountText).not.toBe('');
  }
}
