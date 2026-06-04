import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAddress(
    first: string,
    last: string,
    address: string,
    city: string,
    postal: string,
    country: string,
    phone: string
  ): Promise<void> {
    await this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]').fill(first);
    await this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]').fill(last);
    await this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]').fill(address);
    await this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]').fill(city);
    await this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]').fill(postal);
    await this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]').selectOption({ label: country });
    await this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]').fill(phone);
  }

  async enterBillingAddress(
    first: string,
    last: string,
    address: string,
    city: string,
    postal: string,
    country: string,
    phone: string
  ): Promise<void> {
    const billingCheckbox = this.page.locator('[data-testid="billing-address-checkbox"], input[name="same_as_shipping"]');
    if (await billingCheckbox.isVisible() && await billingCheckbox.isChecked()) {
      await billingCheckbox.uncheck();
    }
    await this.page.locator('[data-testid="billing-first-name-input"], input[name="billing_address.first_name"]').fill(first);
    await this.page.locator('[data-testid="billing-last-name-input"], input[name="billing_address.last_name"]').fill(last);
    await this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]').fill(address);
    await this.page.locator('[data-testid="billing-city-input"], input[name="billing_address.city"]').fill(city);
    await this.page.locator('[data-testid="billing-postal-code-input"], input[name="billing_address.postal_code"]').fill(postal);
    await this.page.locator('[data-testid="billing-country-select"], select[name="billing_address.country_code"]').selectOption({ label: country });
    await this.page.locator('[data-testid="billing-phone-input"], input[name="billing_address.phone"]').fill(phone);
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.locator('[data-testid="checkout-email-input"], input[name="email"]').fill(email);
  }

  async saveAddressDetails(): Promise<void> {
    await this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")').first().click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page.locator('[data-testid="checkout-step-address-completed"], .address-saved-indicator, :has-text("Shipping Details")').first()).toBeVisible();
  }

  async expectOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout');
    const url = this.page.url();
    expect(url).not.toContain('/delivery');
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.page.locator('[data-testid="promo-code-input"], input[name="code"]').fill(code);
    await this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")').click();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="applied-promo-code"], :has-text("${code}")`).first()).toBeVisible();
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    const discountRow = this.page.locator('[data-testid="discount-amount"], .discount-row, :has-text("Discount")').first();
    await expect(discountRow).toBeVisible();
    const text = await discountRow.textContent();
    expect(text).not.toBe('$0.00');
  }
}

// @EP-9
