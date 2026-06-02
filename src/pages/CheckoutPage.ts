import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async enterShippingAndBillingAddress(email: string, address: { firstName: string; lastName: string; address1: string; city: string; postalCode: string; phone: string }): Promise<void> {
    const emailInput = this.page.locator('input[name="email"], input[type="email"], [data-testid="shipping-email-input"], [data-testid="email-input"]').first();
    if (await emailInput.count() > 0 && await emailInput.isVisible()) {
      await emailInput.fill(email);
    }

    const firstNameInput = this.page.locator('input[name="shipping_address.first_name"], input[name="first_name"], [data-testid="shipping-first-name-input"], [data-testid="first-name-input"]').first();
    await firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await firstNameInput.fill(address.firstName);

    await this.page.locator('input[name="shipping_address.last_name"], input[name="last_name"], [data-testid="shipping-last-name-input"], [data-testid="last-name-input"]').first().fill(address.lastName);
    await this.page.locator('input[name="shipping_address.address_1"], input[name="address_1"], [data-testid="shipping-address-input"], [data-testid="address-input"]').first().fill(address.address1);
    await this.page.locator('input[name="shipping_address.city"], input[name="city"], [data-testid="shipping-city-input"], [data-testid="city-input"]').first().fill(address.city);
    await this.page.locator('input[name="shipping_address.postal_code"], input[name="postal_code"], [data-testid="shipping-postal-input"], [data-testid="postal-input"]').first().fill(address.postalCode);
    await this.page.locator('input[name="shipping_address.phone"], input[name="phone"], [data-testid="shipping-phone-input"], [data-testid="phone-input"]').first().fill(address.phone);

    const countrySelect = this.page.locator('select[name="shipping_address.country_code"], select[name="country_code"], [data-testid="shipping-country-select"], [data-testid="country-select"]').first();
    if (await countrySelect.count() > 0 && await countrySelect.isVisible()) {
      try {
        await countrySelect.selectOption({ value: 'es' });
      } catch (e) {
        try {
          await countrySelect.selectOption({ value: 'ES' });
        } catch (e2) {
          try {
            await countrySelect.selectOption({ label: 'España' });
          } catch (e3) {
            try {
              await countrySelect.selectOption({ label: 'Spain' });
            } catch (e4) {
              try {
                await countrySelect.selectOption({ index: 1 });
              } catch (err) {
                // ignore
              }
            }
          }
        }
      }
    }
  }

  async saveAddress(): Promise<void> {
    const saveBtn = this.page.locator('[data-testid="submit-address-button"], [data-testid="submit-shipping-address-button"], button:has-text("Save"), button:has-text("Guardar"), button:has-text("Continuar"), button[type="submit"]').first();
    await saveBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const locator = this.page.locator('[data-testid="edit-address-button"], [data-testid="shipping-address-summary"], [data-testid="address-summary"], [data-testid="delivery-option-radio"], [data-testid="submit-delivery-option-button"], button:has-text("Edit"), button:has-text("Editar"), button:has-text("Modificar")').first();
    await expect(locator).toBeVisible({ timeout: 15000 });
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    const revealBtn = this.page.locator('[data-testid="reveal-discount-button"], button:has-text("Gift Card"), button:has-text("Promo"), button:has-text("Código"), button:has-text("Descuento"), button:has-text("Tarjeta"), button:has-text("Aplicar")').first();
    if (await revealBtn.count() > 0 && await revealBtn.isVisible()) {
      await revealBtn.click();
      await this.page.waitForTimeout(500);
    }
    
    const promoInput = this.page.locator('input[name="code"], [data-testid="discount-input"], [data-testid="promo-input"]').first();
    await promoInput.waitFor({ state: 'visible', timeout: 5000 });
    await promoInput.fill(code);
    
    const applyBtn = this.page.locator('[data-testid="discount-button"], [data-testid="discount-submit-button"], [data-testid="apply-promo-button"], button:has-text("Apply"), button:has-text("Aplicar")').first();
    await applyBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const promoLocator = this.page.locator(`[data-testid="discount-code"], [data-testid="active-discount-badge"], [data-testid="applied-promo"], :has-text("${code}")`).first();
    await expect(promoLocator).toBeVisible({ timeout: 10000 });
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountLocator = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="discount-row"], [data-testid="cart-discount-amount"]').first();
    await expect(discountLocator).toBeVisible({ timeout: 10000 });
  }

  async expectUrlContains(expected: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expected));
  }
}
