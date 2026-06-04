import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingFirstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly shippingLastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly shippingCityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly shippingPostalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly shippingPhoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');
  
  private readonly billingFirstNameInput = () => this.page.locator('[data-testid="billing-first-name-input"], input[name="billing_address.first_name"]');
  private readonly billingLastNameInput = () => this.page.locator('[data-testid="billing-last-name-input"], input[name="billing_address.last_name"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"]');
  private readonly billingCityInput = () => this.page.locator('[data-testid="billing-city-input"], input[name="billing_address.city"]');
  private readonly billingPostalCodeInput = () => this.page.locator('[data-testid="billing-postal-code-input"], input[name="billing_address.postal_code"]');
  private readonly billingPhoneInput = () => this.page.locator('[data-testid="billing-phone-input"], input[name="billing_address.phone"]');
  
  private readonly sameAsBillingCheckbox = () => this.page.locator('[data-testid="billing-address-checkbox"], input[type="checkbox"]#billing-address-checkbox');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly successIndicator = () => this.page.locator('[data-testid="address-saved-indicator"], [data-testid="delivery-step-header"], button:has-text("Edit shipping")');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingDetails(details: { email: string; firstName: string; lastName: string; address: string; city: string; postalCode: string; phone: string }): Promise<void> {
    await this.emailInput().fill(details.email);
    await this.shippingFirstNameInput().fill(details.firstName);
    await this.shippingLastNameInput().fill(details.lastName);
    await this.shippingAddressInput().fill(details.address);
    await this.shippingCityInput().fill(details.city);
    await this.shippingPostalCodeInput().fill(details.postalCode);
    await this.shippingPhoneInput().fill(details.phone);
  }

  async enterBillingDetails(details: { firstName: string; lastName: string; address: string; city: string; postalCode: string; phone: string }): Promise<void> {
    const checkbox = this.sameAsBillingCheckbox();
    if (await checkbox.isVisible() && await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
    await this.billingFirstNameInput().fill(details.firstName);
    await this.billingLastNameInput().fill(details.lastName);
    await this.billingAddressInput().fill(details.address);
    await this.billingCityInput().fill(details.city);
    await this.billingPostalCodeInput().fill(details.postalCode);
    await this.billingPhoneInput().fill(details.phone);
  }

  async saveDetails(): Promise<void> {
    await this.submitAddressButton().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.successIndicator().first()).toBeVisible({ timeout: 10000 });
  }
}

// @EP-9
