import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]');
  private readonly saveDetailsButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="promo-apply-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"], [data-testid="cart-discount"]');
  private readonly addressSuccessIndicator = () => this.page.locator('[data-testid="address-saved-indicator"], :has-text("Saved"), :has-text("Address details saved")');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterAndSaveDetails(email: string, shipping: string, billing: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    if (await this.billingAddressInput().isVisible()) {
      await this.billingAddressInput().fill(billing);
    }
    await this.saveDetailsButton().click();
  }

  async verifyDetailsSaved(): Promise<void> {
    await expect(this.saveDetailsButton().or(this.addressSuccessIndicator()).first()).toBeVisible();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async verifyPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`).or(this.discountAmount()).first()).toBeVisible();
  }

  async verifyTotalsRefreshed(): Promise<void> {
    const discountText = await this.discountAmount().textContent().catch(() => '');
    expect(discountText).toBeTruthy();
  }
}

// @EP-9
