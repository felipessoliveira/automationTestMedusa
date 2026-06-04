import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly addressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly cityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly postalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly phoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');
  private readonly billingSameAsShippingCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[name="same_as_shipping"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="Promo"], input[placeholder*="Discount"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="discount-button"], button:has-text("Apply")');
  private readonly promoAppliedLabel = () => this.page.locator('[data-testid="discount-code-label"], [data-testid="active-discount"]');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount-amount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillShippingAndBilling(
    email: string,
    first: string,
    last: string,
    address: string,
    city: string,
    zip: string,
    phone: string
  ): Promise<void> {
    await this.emailInput().fill(email);
    await this.firstNameInput().fill(first);
    await this.lastNameInput().fill(last);
    await this.addressInput().fill(address);
    await this.cityInput().fill(city);
    await this.postalCodeInput().fill(zip);
    await this.phoneInput().fill(phone);

    const isChecked = await this.billingSameAsShippingCheckbox().isChecked().catch(() => true);
    if (!isChecked) {
      await this.billingSameAsShippingCheckbox().check();
    }
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/.+/);
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.promoAppliedLabel()).toContainText(code);
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount()).toBeVisible();
  }
}