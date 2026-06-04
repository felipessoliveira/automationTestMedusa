import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('input[name="email"], [data-testid="shipping-email-input"]');
  private readonly firstNameInput = () => this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]');
  private readonly lastNameInput = () => this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]');
  private readonly addressInput = () => this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]');
  private readonly cityInput = () => this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]');
  private readonly postalInput = () => this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-input"]');
  private readonly phoneInput = () => this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone-input"]');
  
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save address"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[placeholder*="Promo"], input[name*="code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingDetails(email: string, firstName: string, lastName: string, address: string, city: string, postal: string, phone: string) {
    await this.emailInput().fill(email);
    await this.firstNameInput().fill(firstName);
    await this.lastNameInput().fill(lastName);
    await this.addressInput().fill(address);
    await this.cityInput().fill(city);
    await this.postalInput().fill(postal);
    await this.phoneInput().fill(phone);
  }

  async saveAddress() {
    await this.saveAddressButton().click();
  }

  async applyPromo(code: string) {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectAddressSaved() {
    await expect(this.firstNameInput()).toHaveValue(/.+/);
  }

  async expectPromoApplied(code: string) {
    await expect(this.page.locator(`text=${code}`)).toBeVisible();
  }

  async expectDiscountDisplayed() {
    await expect(this.discountAmount()).toBeVisible();
  }
}

// @EP-9
