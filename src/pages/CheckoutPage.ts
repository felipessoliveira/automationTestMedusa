import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], [name="email"], input[type="email"]');
  private readonly shippingFirstName = () => this.page.locator('[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]');
  private readonly shippingLastName = () => this.page.locator('[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]');
  private readonly shippingAddress = () => this.page.locator('[name="shipping_address.address_1"], [data-testid="shipping-address-input"]');
  private readonly shippingCity = () => this.page.locator('[name="shipping_address.city"], [data-testid="shipping-city-input"]');
  private readonly shippingPostalCode = () => this.page.locator('[name="shipping_address.postal_code"], [data-testid="shipping-postal-input"]');
  private readonly shippingPhone = () => this.page.locator('[name="shipping_address.phone"], [data-testid="shipping-phone-input"]');
  
  private readonly billingSameCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], [name="same_as_shipping"]');
  private readonly saveAddressesButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save address"), button:has-text("Submit")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], [name="code"], input[placeholder*="promo" i]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="promo-apply-button"], button:has-text("Apply")');
  
  private readonly cartSummaryDiscount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');
  private readonly cartSummaryTotal = () => this.page.locator('[data-testid="cart-total"], [data-testid="total-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill('John');
    await this.shippingLastName().fill('Doe');
    await this.shippingAddress().fill('123 Main St');
    await this.shippingCity().fill('New York');
    await this.shippingPostalCode().fill('10001');
    await this.shippingPhone().fill('1234567890');
    
    if (await this.billingSameCheckbox().isVisible()) {
      const isChecked = await this.billingSameCheckbox().isChecked();
      if (!isChecked) {
        await this.billingSameCheckbox().click();
      }
    }
  }

  async saveAddressDetails(): Promise<void> {
    await this.saveAddressesButton().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getDiscountText(): Promise<string> {
    return (await this.cartSummaryDiscount().textContent().catch(() => '')) || '';
  }

  async getTotalText(): Promise<string> {
    return (await this.cartSummaryTotal().textContent().catch(() => '')) || '';
  }
}

// @EP-9
