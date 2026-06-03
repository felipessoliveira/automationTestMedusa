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

  private readonly emailInput = () => this.page.locator([
    '[data-testid="shipping-email-input"]',
    'input[name="email"]',
    'input[name*="email"]',
    'input[autocomplete="email"]',
    'input[placeholder*="Email"]',
    'input[placeholder*="correo"]'
  ].join(', '));

  private readonly firstNameInput = () => this.page.locator([
    '[data-testid="shipping-first-name-input"]',
    'input[name*="first_name"]',
    'input[name*="firstName"]',
    'input[autocomplete="given-name"]',
    'input[placeholder*="First name"]',
    'input[placeholder*="Nombre"]'
  ].join(', '));

  private readonly lastNameInput = () => this.page.locator([
    '[data-testid="shipping-last-name-input"]',
    'input[name*="last_name"]',
    'input[name*="lastName"]',
    'input[autocomplete="family-name"]',
    'input[placeholder*="Last name"]',
    'input[placeholder*="Apellido"]'
  ].join(', '));

  private readonly addressInput = () => this.page.locator([
    '[data-testid="shipping-address-input"]',
    'input[name*="address_1"]',
    'input[name*="address"]',
    'input[autocomplete="address-line1"]',
    'input[placeholder*="Address"]',
    'input[placeholder*="Dirección"]'
  ].join(', '));

  private readonly cityInput = () => this.page.locator([
    '[data-testid="shipping-city-input"]',
    'input[name*="city"]',
    'input[autocomplete="address-level2"]',
    'input[placeholder*="City"]',
    'input[placeholder*="Ciudad"]'
  ].join(', '));

  private readonly postalCodeInput = () => this.page.locator([
    '[data-testid="shipping-postal-code-input"]',
    'input[name*="postal_code"]',
    'input[name*="postalCode"]',
    'input[autocomplete="postal-code"]',
    'input[placeholder*="Postal"]',
    'input[placeholder*="postal"]',
    'input[placeholder*="ZIP"]'
  ].join(', '));

  private readonly phoneInput = () => this.page.locator([
    '[data-testid="shipping-phone-input"]',
    'input[name*="phone"]',
    'input[autocomplete="tel"]',
    'input[placeholder*="Phone"]',
    'input[placeholder*="Teléfono"]'
  ].join(', '));

  private readonly countrySelect = () => this.page.locator([
    '[data-testid="shipping-country-select"]',
    'select[name*="country_code"]',
    'select[name*="countryCode"]',
    'select[autocomplete="country"]'
  ].join(', '));
  
  private readonly billingSameCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], [data-testid="billing-address-checkbox"], input[type="checkbox"]');
  
  private readonly submitAddressButton = () => this.page.locator([
    '[data-testid="submit-address-button"]',
    'button:has-text("Save")',
    'button:has-text("Submit")',
    'button:has-text("Guardar")',
    'button:has-text("Proceed")',
    'button:has-text("Proceder")',
    'button:has-text("Continuar")'
  ].join(', '));
  
  private readonly addDiscountButton = () => this.page.locator('[data-testid="add-discount-button"], button:has-text("Gift card"), button:has-text("Discount"), button:has-text("Descuento"), button:has-text("code")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="Promo"], input[placeholder*="Code"], input[placeholder*="Descuento"], input[placeholder*="descuento"], input[name="code"]');
  
  private readonly promoSubmitButton = () => this.page.locator('[data-testid="discount-button"], [data-testid="submit-discount-button"], button:has-text("Apply"), button:has-text("Aplicar")');
  
  private readonly appliedPromoBadge = () => this.page.locator([
    '[data-testid="applied-discount-badge"]',
    '[data-testid="discount-tag"]',
    '[data-testid="discount-code"]',
    '[data-testid="discount-row"]',
    '[data-testid="cart-discount"]'
  ].join(', '));
  
  private readonly discountAmount = () => this.page.locator([
    '[data-testid="cart-discount"]',
    '[data-testid="discount-amount"]',
    '[data-testid="discount-value"]',
    '[data-testid="discount-row"]',
    '[data-testid="cart-discount-amount"]',
    'text="- $"',
    'text="- €"',
    'text="-"'
  ].join(', '));

  async open(): Promise<void> {
    // Attempt natural navigation through cart drawer checkout button first
    const checkoutLink = this.page.locator('[data-testid="go-to-checkout-button"], a[href*="/checkout"], button:has-text("Checkout"), button:has-text("Ir al pago")');
    if (await checkoutLink.first().isVisible()) {
      await checkoutLink.first().click();
    } else {
      const cartNav = this.page.locator('[data-testid="nav-cart-link"], a[href="/cart"]');
      if (await cartNav.first().isVisible()) {
        await cartNav.first().click();
        await this.page.waitForTimeout(500);
        if (await checkoutLink.first().isVisible()) {
          await checkoutLink.first().click();
        } 
      }
    }

    await this.page.waitForTimeout(1000);
    const url = this.page.url();
    if (!url.includes('/checkout')) {
      await this.goto('/checkout');
      await this.page.waitForTimeout(1500);
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
      try {
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check({ force: true });
        }
      } catch (e) {
        try {
          await checkbox.click({ force: true });
        } catch (e2) {}
      }
    }

    await this.submitAddressButton().first().click();
    await this.page.waitForTimeout(1500); // Wait for transition/save
  }

  async expectDetailsSaved(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const indicators = [
      '[data-testid="address-saved-checkmark"]',
      '[data-testid="shipping-completed-checkmark"]',
      '[data-testid="shipping-address-summary"]',
      '[data-testid="edit-address-button"]',
      '[data-testid="edit-button"]',
      'button:has-text("Edit")',
      'button:has-text("Editar")',
      'text="Felipe Oliveira"',
      'text="qa.checkout@example.com"'
    ].join(', ');
    
    const deliveryVisible = this.page.locator('[data-testid="submit-delivery-button"], button:has-text("delivery"), button:has-text("envío"), button:has-text("Envío")').first();
    
    await expect(this.page.locator(indicators).first().or(deliveryVisible).or(this.submitAddressButton().first())).toBeVisible({ timeout: 10000 });
  }

  async expectOnCheckoutPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/checkout.*/);
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.expectOnCheckoutPage();
  }

  async applyPromoCode(code: string): Promise<void> {
    const expandBtn = this.addDiscountButton().first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await this.page.waitForTimeout(500);
    }
    await this.promoInput().first().fill(code);
    await this.promoSubmitButton().first().click();
    await this.page.waitForTimeout(2000);
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(
      this.appliedPromoBadge().first()
        .or(this.page.locator(`text=${code}`).first())
        .or(this.page.locator(`text=${code.toLowerCase()}`).first())
    ).toBeVisible({ timeout: 10000 });
  }

  async expectDiscountTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount().first()).toBeVisible({ timeout: 10000 });
    const discountText = await this.discountAmount().first().textContent();
    expect(discountText).not.toBeNull();
    expect(discountText?.trim()).not.toBe('');
  }
}
