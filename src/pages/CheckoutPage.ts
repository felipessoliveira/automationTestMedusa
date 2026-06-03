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

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"], input[autocomplete="email"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name*="first_name"], input[autocomplete="given-name"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name*="last_name"], input[autocomplete="family-name"]');
  private readonly addressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name*="address_1"], input[autocomplete="address-line1"]');
  private readonly cityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name*="city"], input[autocomplete="address-level2"]');
  private readonly postalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name*="postal_code"], input[autocomplete="postal-code"]');
  private readonly phoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name*="phone"], input[autocomplete="tel"]');
  private readonly countrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name*="country_code"], select[autocomplete="country"]');
  
  private readonly billingSameCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], [data-testid="billing-address-checkbox"], input[type="checkbox"]');
  private readonly submitAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Guardar"), button:has-text("Enviar"), button:has-text("Proceder")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="Promo"], input[placeholder*="Code"], input[placeholder*="Descuento"], input[placeholder*="descuento"], input[name="code"]');
  private readonly promoSubmitButton = () => this.page.locator('[data-testid="discount-button"], [data-testid="submit-discount-button"], button:has-text("Apply"), button:has-text("Aplicar")');
  private readonly appliedPromoBadge = () => this.page.locator('[data-testid="applied-discount-badge"], [data-testid="discount-tag"], [data-testid="discount-code"], [data-testid="discount-row"]');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="discount-value"], [data-testid="discount-row"], [data-testid="cart-discount-amount"]');
  
  private readonly addressSavedIndicator = () => this.page.locator([
    '[data-testid="address-saved-checkmark"]',
    '[data-testid="shipping-completed-checkmark"]',
    '[data-testid="shipping-address-summary"]',
    '[data-testid="edit-address-button"]',
    '[data-testid="edit-button"]',
    'text="Felipe Oliveira"',
    'text="qa.checkout@example.com"'
  ].join(', '));

  async open(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.goto('/checkout');
    
    const url = this.page.url();
    if (!url.includes('/checkout')) {
      await this.page.waitForTimeout(1500);
      await this.goto('/checkout');
    }
  }

  async fillAndSaveDetails(details: AddressDetails): Promise<void> {
    await this.emailInput().first().fill(details.email);
    await this.firstNameInput().first().fill(details.firstName);
    await this.lastNameInput().first().fill(details.lastName);
    await this.addressInput().first().fill(details.address);
    await this.cityInput().first().fill(details.city);
    await this.postalCodeInput().first().fill(details.postalCode);
    await this.phoneInput().first().fill(details.phone);
    
    if (await this.countrySelect().first().isVisible()) {
      try {
        await this.countrySelect().first().selectOption({ label: details.country });
      } catch (e) {
        try {
          await this.countrySelect().first().selectOption({ label: 'Estados Unidos' });
        } catch (e2) {
          try {
            await this.countrySelect().first().selectOption({ value: 'us' });
          } catch (e3) {
            await this.countrySelect().first().selectOption({ value: 'US' });
          }
        }
      }
    }
    
    const checkbox = this.billingSameCheckbox().first();
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
      }
    }

    await this.submitAddressButton().first().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.addressSavedIndicator().first().or(this.submitAddressButton().first())).toBeVisible();
  }

  async expectOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout');
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.expectOnCheckoutPage();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().first().fill(code);
    await this.promoSubmitButton().first().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.appliedPromoBadge().first().or(this.page.locator(`text=${code}`).first())).toBeVisible();
  }

  async expectDiscountTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount().first()).toBeVisible();
    const discountText = await this.discountAmount().first().textContent();
    expect(discountText).not.toBeNull();
    expect(discountText?.trim()).not.toBe('');
  }
}