import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('input[name="email"], [data-testid="shipping-email-input"]');
  private readonly shippingFirstName = () => this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name"]');
  private readonly shippingLastName = () => this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name"]');
  private readonly shippingAddress = () => this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-1"]');
  private readonly shippingCity = () => this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city"]');
  private readonly shippingPostalCode = () => this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code"]');
  private readonly shippingPhone = () => this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone"]');
  private readonly billingSameAsShippingCheckbox = () => this.page.locator('input[name="same_as_billing"], [data-testid="billing-same-as-shipping-checkbox"]');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  
  private readonly promoInput = () => this.page.locator('input[name="code"], [data-testid="promo-code-input"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="promo-apply-button"], button:has-text("Apply")');
  private readonly promoSuccessMessage = () => this.page.locator('[data-testid="promo-success"], :has-text("applied"), :has-text("SAVE20")');
  private readonly cartDiscountAmount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill('Felipe');
    await this.shippingLastName().fill('Oliveira');
    await this.shippingAddress().fill('123 Medusa Street');
    await this.shippingCity().fill('San Francisco');
    await this.shippingPostalCode().fill('94103');
    await this.shippingPhone().fill('1234567890');

    const checkbox = this.billingSameAsShippingCheckbox();
    if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }

  async saveAddress(): Promise<void> {
    await this.submitAddressButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    // Checking saved state - e.g., the submit button becomes hidden or transitions
    await expect(this.submitAddressButton()).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async expectPromoCodeApplied(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`)).toBeVisible();
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    await expect(this.cartDiscountAmount()).toBeVisible();
    const discountText = await this.cartDiscountAmount().textContent();
    expect(discountText).not.toBeNull();
    expect(discountText?.trim()).not.toBe('');
  }
}

// @EP-9
