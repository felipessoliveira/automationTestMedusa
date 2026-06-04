import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address"]');
  private readonly emailInput = () => this.page.locator('[data-testid="email-input"], input[name="email"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save")');
  private readonly promoCodeInput = () => this.page.locator('[data-testid="promo-code-input"], input[name="promo-code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"], [data-testid="cart-discount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingDetails(shipping: string, billing: string, email: string): Promise<void> {
    await this.shippingAddressInput().fill(shipping);
    await this.billingAddressInput().fill(billing);
    await this.emailInput().fill(email);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoCodeInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.shippingAddressInput()).toHaveValue(/./);
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`)).toBeVisible();
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount()).toBeVisible();
  }
}

// @EP-9
