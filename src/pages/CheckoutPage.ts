import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly cityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly postalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly phoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');
  private readonly countrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Submit"), button:has-text("Save")');
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], [data-testid="promo-input"], input[name="promo_code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="discount-button"], [data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly cartSummaryDiscount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
    await this.emailInput().first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async enterDetails(shipping: string, billing: string, email: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.firstNameInput().fill('John');
    await this.lastNameInput().fill('Doe');
    await this.shippingAddressInput().fill(shipping);
    await this.cityInput().fill('Miami');
    await this.postalCodeInput().fill('33101');
    await this.phoneInput().fill('1234567890');
    if (await this.countrySelect().isVisible()) {
      await this.countrySelect().selectOption({ index: 1 });
    }
    const checkbox = this.page.locator('[data-testid="billing-address-checkbox"]');
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.click();
      }
    }
  }

  async saveAddress(): Promise<void> {
    await this.submitAddressButton().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const summary = this.page.locator('[data-testid="shipping-address-summary"]');
    const indicator = this.page.locator('[data-testid="address-saved-indicator"]');
    const activeDelivery = this.page.locator('[data-testid="delivery-option-radio"], :text("Delivery")');

    await expect(
      summary.first().or(indicator.first()).or(activeDelivery.first())
    ).toBeVisible({ timeout: 15000 });
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    const discountBadge = this.page.locator('[data-testid="discount-code"]');
    if (await discountBadge.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(discountBadge.first()).toContainText(code, { ignoreCase: true });
    } else {
      await expect(this.page.locator(`text=${code}`).first()).toBeVisible({ timeout: 10000 });
    }
  }

  async expectDiscountDisplayed(): Promise<void> {
    await expect(this.cartSummaryDiscount().first()).toBeVisible({ timeout: 10000 });
    const text = await this.cartSummaryDiscount().first().textContent();
    expect(text).not.toBeNull();
  }
}
