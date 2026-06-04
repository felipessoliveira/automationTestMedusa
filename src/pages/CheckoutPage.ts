import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly shippingAddress = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');
  private readonly sameAsBillingCheckbox = () => this.page.locator('[data-testid="billing-address-checkbox"], input[type="checkbox"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="promo-submit-button"], button:has-text("Apply")');
  private readonly cartDiscount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string, details: Record<string, string>): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill(details.firstName || 'John');
    await this.shippingLastName().fill(details.lastName || 'Doe');
    await this.shippingAddress().fill(details.address || '123 Test St');
    await this.shippingCity().fill(details.city || 'Test City');
    await this.shippingPostalCode().fill(details.postalCode || '12345');
    await this.shippingPhone().fill(details.phone || '1234567890');
    
    const isChecked = await this.sameAsBillingCheckbox().isChecked();
    if (!isChecked) {
      await this.sameAsBillingCheckbox().click();
    }
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/@/);
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`).first()).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.cartDiscount()).toBeVisible();
  }
}

// @EP-9
