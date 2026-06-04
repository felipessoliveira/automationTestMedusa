import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"], input[type="email"]');
  private readonly shippingFirstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"], input[name="first_name"]');
  private readonly shippingLastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"], input[name="last_name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"], input[name="address_1"]');
  private readonly shippingCityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"], input[name="city"]');
  private readonly shippingPostalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"], input[name="postal_code"]');
  private readonly shippingPhoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"], input[name="phone"]');
  
  private readonly billingFirstNameInput = () => this.page.locator('[data-testid="billing-first-name-input"], input[name="billing_address.first_name"], input[name="billing_first_name"]');
  private readonly billingLastNameInput = () => this.page.locator('[data-testid="billing-last-name-input"], input[name="billing_address.last_name"], input[name="billing_last_name"]');
  private readonly billingAddressInput = () => this.page.locator('[data-testid="billing-address-input"], input[name="billing_address.address_1"], input[name="billing_address_1"]');
  private readonly billingCityInput = () => this.page.locator('[data-testid="billing-city-input"], input[name="billing_address.city"], input[name="billing_city"]');
  private readonly billingPostalCodeInput = () => this.page.locator('[data-testid="billing-postal-code-input"], input[name="billing_address.postal_code"], input[name="billing_postal_code"]');
  private readonly billingPhoneInput = () => this.page.locator('[data-testid="billing-phone-input"], input[name="billing_address.phone"], input[name="billing_phone"]');
  
  private readonly sameAsBillingCheckbox = () => this.page.locator('[data-testid="billing-address-checkbox"], input[type="checkbox"]#billing-address-checkbox, [role="checkbox"], label:has-text("Same as shipping"), label:has-text("same as billing")');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Deliver to this address"), button:has-text("Continue to delivery"), button:has-text("Submit address")');
  private readonly successIndicator = () => this.page.locator('[data-testid="address-saved-indicator"], [data-testid="shipping-address-summary"], [data-testid="delivery-step-header"], button:has-text("Edit shipping"), button:has-text("Edit"), h2:has-text("Delivery"), h2:has-text("Shipping Method")');

  async open(): Promise<void> {
    // If we are already on /cart, click the checkout button to transition naturally
    const checkoutButton = this.page.locator('[data-testid="checkout-button"], a[href="/checkout"], button:has-text("Go to checkout"), button:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    } else {
      await this.goto('/checkout');
    }
    // Wait for the email input to confirm page hydration
    const emailInputLocator = this.emailInput().first();
    await emailInputLocator.waitFor({ state: 'visible', timeout: 20000 });
  }

  async enterShippingDetails(details: { email: string; firstName: string; lastName: string; address: string; city: string; postalCode: string; phone: string }): Promise<void> {
    await this.emailInput().first().fill(details.email);
    await this.shippingFirstNameInput().first().fill(details.firstName);
    await this.shippingLastNameInput().first().fill(details.lastName);
    await this.shippingAddressInput().first().fill(details.address);
    await this.shippingCityInput().first().fill(details.city);
    await this.shippingPostalCodeInput().first().fill(details.postalCode);
    await this.shippingPhoneInput().first().fill(details.phone);
  }

  async enterBillingDetails(details: { firstName: string; lastName: string; address: string; city: string; postalCode: string; phone: string }): Promise<void> {
    const checkbox = this.sameAsBillingCheckbox().first();
    if (await checkbox.isVisible()) {
      const isChecked = (await checkbox.getAttribute('aria-checked')) === 'true' || await checkbox.isChecked();
      if (isChecked) {
        await checkbox.click({ force: true });
        await this.page.waitForTimeout(1000);
      }
    }
    await this.billingFirstNameInput().first().fill(details.firstName);
    await this.billingLastNameInput().first().fill(details.lastName);
    await this.billingAddressInput().first().fill(details.address);
    await this.billingCityInput().first().fill(details.city);
    await this.billingPostalCodeInput().first().fill(details.postalCode);
    await this.billingPhoneInput().first().fill(details.phone);
  }

  async saveDetails(): Promise<void> {
    await this.submitAddressButton().first().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.successIndicator().first()).toBeVisible({ timeout: 15000 });
  }

  async expectUrlContains(expected: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expected));
  }
}
