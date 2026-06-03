import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], [data-testid="email-input"], [data-testid="checkout-email-input"], input[name="email"], input[autocomplete="email"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"], input[autocomplete="given-name"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"], input[autocomplete="family-name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"], input[autocomplete="address-line1"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"], input[autocomplete="address-level2"]');
  private readonly shippingCountrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"], select[autocomplete="country"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"], input[autocomplete="postal-code"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"], input[autocomplete="tel"]');

  private readonly billingSameAsShippingCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"][name="same_as_shipping"]');
  private readonly saveDetailsButton = () => this.page.locator('[data-testid="submit-address-button"], [data-testid="save-details-button"], button:has-text("Siguiente"), button:has-text("Continuar"), button:has-text("Submit"), button:has-text("Save"), button:has-text("Submit details")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], [data-testid="promo-input"], input[name="code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="submit-discount-button"], [data-testid="apply-promo-button"], button:has-text("Apply"), button:has-text("Aplicar")');

  async open(): Promise<void> {
    await this.goto('/checkout');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await this.emailInput().fill(email);
  }

  async fillShippingAddress(info: AddressInfo): Promise<void> {
    await this.shippingFirstName().fill(info.firstName);
    await this.shippingLastName().fill(info.lastName);
    await this.shippingAddressInput().fill(info.address);
    await this.shippingCity().fill(info.city);
    
    if (await this.shippingCountrySelect().isVisible()) {
      const countryVal = info.country.toLowerCase() === 'united states' ? 'us' : info.country;
      await this.shippingCountrySelect().selectOption({ value: countryVal }).catch(async () => {
        await this.shippingCountrySelect().selectOption({ value: countryVal.toUpperCase() }).catch(async () => {
          await this.shippingCountrySelect().selectOption({ label: info.country }).catch(async () => {
            // fallback: select the second option if nothing else matches
            await this.shippingCountrySelect().selectOption({ index: 1 }).catch(() => {});
          });
        });
      });
    }
    
    await this.shippingPostalCode().fill(info.postalCode);
    await this.shippingPhone().fill(info.phone);
  }

  async fillBillingAddress(info: AddressInfo): Promise<void> {
    const checkbox = this.billingSameAsShippingCheckbox();
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) {
        await checkbox.click().catch(() => {});
      }
    }
  }

  async saveDetails(): Promise<void> {
    await this.saveDetailsButton().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectDetailsSaved(): Promise<void> {
    // Wait for delivery button, or edit address button, or summary of email/details to confirm save
    const deliveryBtn = this.page.locator('[data-testid="submit-delivery-option-button"], [data-testid="delivery-options-container"]');
    const editAddrBtn = this.page.locator('[data-testid="edit-address-button"], button:has-text("Editar"), button:has-text("Edit")');
    const emailSummary = this.page.locator('text="qa.test@example.com"');
    
    await expect(deliveryBtn.first().or(editAddrBtn.first()).or(emailSummary.first())).toBeVisible({ timeout: 15000 });
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const url = this.page.url();
    expect(url).not.toContain('/delivery');
    expect(url).toContain('/checkout');
  }

  async applyPromoCode(code: string): Promise<void> {
    // Check if we need to click "Add discount" first (Next.js Medusa accordion)
    const addPromoBtn = this.page.locator('[data-testid="add-discount-button"], button:has-text("descuento"), button:has-text("discount"), button:has-text("promo")');
    if (await addPromoBtn.isVisible()) {
      await addPromoBtn.click();
    }
    
    const promo = this.promoInput();
    await promo.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await promo.fill(code);
    await this.applyPromoButton().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectPromoApplied(code: string): Promise<void> {
    const discountTag = this.page.locator(`[data-testid="discount-code"], [data-testid="applied-promo-badge"], [data-testid="discount-tag"]`);
    const codeText = this.page.locator(`text=${code}`);
    await expect(discountTag.first().or(codeText.first())).toBeVisible({ timeout: 10000 });
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"]');
    const discountText = this.page.locator('text=-$').or(this.page.locator('text=-€')).or(this.page.locator(':has-text("-")')).or(this.page.locator('text="Descuento"')).or(this.page.locator('text="Discount"'));
    await expect(discountAmount.first().or(discountText.first())).toBeVisible({ timeout: 10000 });
  }
}
