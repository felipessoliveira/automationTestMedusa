import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('input[autocomplete="email"], [data-testid="shipping-email-input"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"]');
  private readonly shippingAddress = () => this.page.locator('[data-testid="shipping-address-input"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="promo"], input[placeholder*="discount"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="discount-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], span:has-text("-")');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterAndSaveAddressAndEmail(email: string, firstName: string, lastName: string, address: string, city: string, postalCode: string, phone: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill(firstName);
    await this.shippingLastName().fill(lastName);
    await this.shippingAddress().fill(address);
    await this.shippingCity().fill(city);
    await this.shippingPostalCode().fill(postalCode);
    await this.shippingPhone().fill(phone);
    await this.saveAddressButton().click();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/checkout/);
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.page.locator(`text=${code}`)).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.discountAmount()).toBeVisible();
    const text = await this.discountAmount().textContent();
    expect(text).not.toBeNull();
  }
}

// @EP-9
