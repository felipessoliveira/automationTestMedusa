import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save address")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="promo_code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly savedAddressIndicator = () => this.page.locator('[data-testid="saved-address-indicator"], :has-text("Address saved")');
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"], .discount, [data-testid="cart-discount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingDetails(shipping: string, billing: string, email: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    await this.billingAddressInput().fill(billing);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.savedAddressIndicator().first()).toBeVisible({ timeout: 5000 });
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`)).toBeVisible({ timeout: 5000 });
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.discountAmount().first()).toBeVisible({ timeout: 5000 });
  }
}

// @EP-9
