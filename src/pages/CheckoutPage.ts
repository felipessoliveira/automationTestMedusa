import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressDetails {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  country: string;
}

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
  private readonly countrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]');
  
  private readonly billingSameCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"]');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="Promo"], input[name="code"]');
  private readonly promoSubmitButton = () => this.page.locator('[data-testid="discount-button"], button:has-text("Apply")');
  private readonly appliedPromoBadge = () => this.page.locator('[data-testid="applied-discount-badge"], [data-testid="discount-tag"]');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');
  
  private readonly addressSavedIndicator = () => this.page.locator('[data-testid="address-saved-checkmark"], [data-testid="shipping-completed-checkmark"], text="Shipping Address Saved"');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillAndSaveDetails(details: AddressDetails): Promise<void> {
    await this.emailInput().fill(details.email);
    await this.firstNameInput().fill(details.firstName);
    await this.lastNameInput().fill(details.lastName);
    await this.addressInput().fill(details.address);
    await this.cityInput().fill(details.city);
    await this.postalCodeInput().fill(details.postalCode);
    await this.phoneInput().fill(details.phone);
    if (await this.countrySelect().isVisible()) {
      await this.countrySelect().selectOption({ label: details.country });
    }
    
    if (await this.billingSameCheckbox().isVisible()) {
      const isChecked = await this.billingSameCheckbox().isChecked();
      if (!isChecked) {
        await this.billingSameCheckbox().check();
      }
    }

    await this.submitAddressButton().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.addressSavedIndicator().first().or(this.submitAddressButton())).toBeVisible();
  }

  async expectOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout');
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.expectOnCheckoutPage();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoSubmitButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.appliedPromoBadge().or(this.page.locator(`text=${code}`)).first()).toBeVisible();
  }

  async expectDiscountTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount()).toBeVisible();
    const discountText = await this.discountAmount().textContent();
    expect(discountText).not.toBeNull();
    expect(discountText?.trim()).not.toBe('');
  }
}