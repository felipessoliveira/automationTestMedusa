import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly promoSubmitButton = () => this.page.locator('[data-testid="promo-submit-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"]');
  private readonly cartTotal = () => this.page.locator('[data-testid="cart-total"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string, shipping: string, billing: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    await this.billingAddressInput().fill(billing);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoSubmitButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/.+/);
  }

  async expectOnCheckoutPageWithoutRedirection(): Promise<void> {
    await this.expectUrlContains('/checkout');
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.discountAmount()).toBeVisible();
    await expect(this.discountAmount()).toContainText(code, { ignoreCase: true });
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.cartTotal()).toBeVisible();
  }
}
