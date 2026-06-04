import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="email-input"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"]');
  private readonly addressSavedIndicator = () => this.page.locator('[data-testid="address-saved-indicator"]');
  
  private readonly promoInput = () => this.page.locator('[data-testid="promo-code-input"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="apply-promo-button"]');
  private readonly promoSuccessMessage = () => this.page.locator('[data-testid="promo-success-msg"]');
  private readonly cartSummaryTotals = () => this.page.locator('[data-testid="cart-summary-totals"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterAndSaveDetails(email: string, shipping: string, billing: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    await this.billingAddressInput().fill(billing);
    await this.saveAddressButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.addressSavedIndicator()).toBeVisible({ timeout: 5000 });
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.promoSuccessMessage()).toContainText(code);
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.cartSummaryTotals()).toBeVisible();
  }
}

// @EP-9
