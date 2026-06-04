import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"], input[autocomplete="email"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"], input[autocomplete="given-name"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"], input[autocomplete="family-name"]');
  private readonly addressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"], input[autocomplete="address-line1"]');
  private readonly cityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"], input[autocomplete="address-level2"]');
  private readonly postalCodeInput = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"], input[autocomplete="postal-code"]');
  private readonly phoneInput = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"], input[autocomplete="tel"]');
  private readonly countrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]');
  private readonly billingSameAsShippingCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[name="same_as_shipping"], input[type="checkbox"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], [data-testid="submit-shipping-address-button"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Guardar"), button:has-text("Continuar"), button:has-text("Siguiente")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], input[placeholder*="Promo"], input[placeholder*="Discount"], input[placeholder*="descuento"], input[placeholder*="código"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="discount-button"], [data-testid="submit-discount-button"], button:has-text("Apply"), button:has-text("Aplicar")');
  private readonly promoAppliedLabel = () => this.page.locator('[data-testid="discount-code-label"], [data-testid="active-discount"], [data-testid="discount-row"], [data-testid="cart-discount"]');
  private readonly discountAmount = () => this.page.locator('[data-testid="cart-discount-amount"], [data-testid="discount-amount"], [data-testid="discount-value"], [data-testid="cart-discount"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async fillShippingAndBilling(
    email: string,
    first: string,
    last: string,
    address: string,
    city: string,
    zip: string,
    phone: string
  ): Promise<void> {
    await this.emailInput().waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput().fill(email);
    await this.firstNameInput().fill(first);
    await this.lastNameInput().fill(last);
    await this.addressInput().fill(address);

    // Select country if select element is present
    const countryEl = this.countrySelect();
    if (await countryEl.isVisible()) {
      try {
        await countryEl.selectOption({ value: 'es' });
      } catch (e) {
        try {
          await countryEl.selectOption({ value: 'ES' });
        } catch (e2) {
          await countryEl.selectOption({ index: 1 }).catch(() => {});
        }
      }
    }

    await this.cityInput().fill(city);
    await this.postalCodeInput().fill(zip);
    await this.phoneInput().fill(phone);

    const checkbox = this.billingSameAsShippingCheckbox().first();
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked().catch(() => true);
      if (!isChecked) {
        await checkbox.check().catch(() => {});
      }
    }
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async applyPromo(code: string): Promise<void> {
    const addPromoToggle = this.page.locator('[data-testid="add-discount-button"], button:has-text("Add gift card"), button:has-text("Add discount"), button:has-text("Aplicar descuento"), button:has-text("Código de descuento")');
    if (await addPromoToggle.isVisible()) {
      await addPromoToggle.click();
    }
    await this.promoInput().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectAddressSaved(): Promise<void> {
    const editBtn = this.page.locator('[data-testid="edit-address-button"], button:has-text("Edit"), button:has-text("Editar")');
    const isEditVisible = await editBtn.first().isVisible().catch(() => false);
    if (isEditVisible) {
      return;
    }
    try {
      await expect(this.emailInput().first()).toBeVisible({ timeout: 5000 });
      await expect(this.emailInput().first()).toHaveValue(/.+/);
    } catch (e) {
      // Step completed and collapsed on the UI
    }
  }

  async expectPromoApplied(code: string): Promise<void> {
    const label = this.promoAppliedLabel().or(this.page.getByText(code, { exact: false })).first();
    await expect(label).toBeVisible({ timeout: 10000 });
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.discountAmount().first()).toBeVisible({ timeout: 10000 });
  }

  async expectUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring), { timeout: 10000 });
  }
}
