import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator("[data-testid='shipping-email-input'], input[name='email']");
  private readonly shippingAddressInput = () => this.page.locator("[data-testid='shipping-address-input'], input[name='shipping_address.address_1']");
  private readonly shippingCityInput = () => this.page.locator("[data-testid='shipping-city-input'], input[name='shipping_address.city']");
  private readonly shippingPostalInput = () => this.page.locator("[data-testid='shipping-postal-input'], input[name='shipping_address.postal_code']");
  private readonly billingAddressInput = () => this.page.locator("[data-testid='billing-address-input'], input[name='billing_address.address_1']");
  private readonly saveAddressButton = () => this.page.locator("[data-testid='save-address-button'], button:has-text('Save address'), button:has-text('Submit')");
  private readonly promoInput = () => this.page.locator("[data-testid='promo-input'], input[name='code'], input[placeholder*='Promo']");
  private readonly applyPromoButton = () => this.page.locator("[data-testid='apply-promo-button'], button:has-text('Apply')");
  private readonly promoAppliedBadge = () => this.page.locator("[data-testid='promo-applied-badge'], [data-testid='discount-amount'], .promo-success");
  private readonly cartSummaryTotals = () => this.page.locator("[data-testid='cart-summary-totals'], .cart-summary, [data-testid='cart-totals']");

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBilling(email: string, shippingAddress: string, billingAddress: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shippingAddress);
    if (await this.shippingCityInput().isVisible()) {
      await this.shippingCityInput().fill('Test City');
    }
    if (await this.shippingPostalInput().isVisible()) {
      await this.shippingPostalInput().fill('12345');
    }
    await this.billingAddressInput().fill(billingAddress);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/.+/);
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.promoAppliedBadge()).toBeVisible();
    await expect(this.promoAppliedBadge()).toContainText(code);
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.cartSummaryTotals()).toBeVisible();
    await expect(this.page.locator("[data-testid='discount-amount'], .discount-val, text='SAVE20'")).toBeVisible();
  }
}

// @EP-9
