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
  
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly promoSubmitButton = () => this.page.locator('[data-testid="promo-submit-button"], button:has-text("Apply")');
  private readonly discountValue = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingDetails(email: string, shipping: string, billing: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingAddressInput().fill(shipping);
    
    const billingCheckbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"]');
    if (await billingCheckbox.isVisible() && await billingCheckbox.isChecked()) {
      await billingCheckbox.uncheck();
    }
    await this.billingAddressInput().fill(billing);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoSubmitButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/@/);
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`)).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.discountValue()).toBeVisible();
  }
}

// @EP-9
