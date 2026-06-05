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
  private readonly sameAsBillingCheckbox = () => this.page.locator('[data-testid="same-as-billing-checkbox"], input[name="same_as_billing"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly addressSummary = () => this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingDetails(
    email: string,
    firstName: string,
    lastName: string,
    address: string,
    city: string,
    postalCode: string,
    phone: string
  ): Promise<void> {
    await this.emailInput().fill(email);
    await this.firstNameInput().fill(firstName);
    await this.lastNameInput().fill(lastName);
    await this.addressInput().fill(address);
    await this.cityInput().fill(city);
    await this.postalCodeInput().fill(postalCode);
    await this.phoneInput().fill(phone);
  }

  async checkSameAsBilling(): Promise<void> {
    const checkbox = this.sameAsBillingCheckbox();
    if (await checkbox.isVisible() && !(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.addressSummary().or(this.page.locator('text=Saved'))).toBeVisible({ timeout: 10000 });
  }

  async expectEmailSaved(email: string): Promise<void> {
    await expect(this.page.locator(`text=${email}`)).toBeVisible();
  }
}

// @EP-9
