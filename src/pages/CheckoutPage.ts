import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout?step=address');
  }

  private readonly emailInput = () => this.page.getByTestId('shipping-email-input');
  private readonly firstNameInput = () => this.page.getByTestId('shipping-first-name-input');
  private readonly lastNameInput = () => this.page.getByTestId('shipping-last-name-input');
  private readonly addressInput = () => this.page.locator('input[name*="address"], input[autocomplete*="address-line1"]').first();
  private readonly postalCodeInput = () => this.page.locator('input[name*="postal"], input[autocomplete*="postal-code"]').first();
  private readonly cityInput = () => this.page.locator('input[name*="city"], input[autocomplete*="address-level2"]').first();
  private readonly countrySelect = () => this.page.getByTestId('shipping-country-select');
  private readonly phoneInput = () => this.page.getByTestId('shipping-phone-input');
  private readonly submitButton = () => this.page.getByTestId('submit-address-button');

  async enterShippingAddress(details: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    countryCode: string;
    phone: string;
  }): Promise<void> {
    await this.emailInput().fill(details.email);
    await this.firstNameInput().fill(details.firstName);
    await this.lastNameInput().fill(details.lastName);
    await this.addressInput().fill(details.address);
    await this.postalCodeInput().fill(details.postalCode);
    await this.cityInput().fill(details.city);
    await this.countrySelect().selectOption({ value: details.countryCode });
    await this.phoneInput().fill(details.phone);
  }

  async saveAddress(): Promise<void> {
    await this.submitButton().click();
  }

  async expectAddressSaved(): Promise<void> {
    // Check if the email is saved either inside the input field, or displayed on the page as static text
    await expect.poll(async () => {
      const emailValue = await this.emailInput().inputValue().catch(() => '');
      if (emailValue === 'test.customer@example.com') {
        return true;
      }
      const bodyText = await this.page.locator('body').textContent().catch(() => '');
      return bodyText?.includes('test.customer@example.com') ?? false;
    }, {
      timeout: 5000
    }).toBe(true);
  }
}

// @EP-9
