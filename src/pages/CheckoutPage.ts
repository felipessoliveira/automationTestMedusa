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
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")').first();
  
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"], [data-testid="cart-discount"]');
  private readonly inlineError = () => this.page.locator('[data-testid="promo-error-message"], .text-rose-500, [role="alert"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAndEmail(email: string, firstName: string, lastName: string, address: string, city: string, postalCode: string, phone: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill(firstName);
    await this.shippingLastName().fill(lastName);
    await this.shippingAddress().fill(address);
    await this.shippingCity().fill(city);
    await this.shippingPostalCode().fill(postalCode);
    await this.shippingPhone().fill(phone);
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromoCode(code: string): Promise<void> {
    if (code) {
      await this.promoInput().fill(code);
    } else {
      await this.promoInput().clear();
    }
    await this.applyPromoButton().click();
  }

  async getDiscountText(): Promise<string> {
    return (await this.discountAmount().textContent()) || '';
  }

  async getInlineErrorText(): Promise<string> {
    return (await this.inlineError().textContent()) || '';
  }

  async expectNoRedirect(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/checkout/);
  }
}

// @EP-9
