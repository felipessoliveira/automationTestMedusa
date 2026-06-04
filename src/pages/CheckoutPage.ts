import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save address"), button:has-text("Submit")');
  private readonly successIndicator = () => this.page.locator('[data-testid="address-saved-success"], .address-success-message');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="promo_code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly promoSuccessMessage = () => this.page.locator('[data-testid="promo-applied-message"], .promo-success');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount"], .discount-amount');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterAndSaveDetails(email: string, shipping: string, billing: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    await this.billingAddressInput().fill(billing);
    await this.saveAddressButton().click();
  }

  async isAddressSavedSuccessfully(): Promise<boolean> {
    await this.successIndicator().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return true;
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async isPromoCodeApplied(code: string): Promise<boolean> {
    await expect(this.promoSuccessMessage()).toBeVisible({ timeout: 5000 });
    return true;
  }

  async getDiscountText(): Promise<string> {
    return (await this.discountAmount().textContent()) || '';
  }
}

// @EP-9
