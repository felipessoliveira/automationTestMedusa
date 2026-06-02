import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
    await this.goto('/checkout');
    await this.page.waitForLoadState('domcontentloaded');
    
    if (this.page.url().endsWith('/') || this.page.url().includes('/cart')) {
      await this.goto('/cart');
      const checkoutBtn = this.page.locator('[data-testid="checkout-button"], button:has-text("Checkout"), button:has-text("Pagar"), a:has-text("Checkout"), a[href="/checkout"]').first();
      await checkoutBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await checkoutBtn.count() > 0) {
        await checkoutBtn.click();
      } else {
        await this.goto('/checkout');
      }
    }
    await this.page.waitForURL(/\/checkout/, { timeout: 10000 }).catch(() => {});
  }

  async enterShippingAndBillingAddress(email: string, address: { firstName: string; lastName: string; address1: string; city: string; postalCode: string; phone: string }): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    const emailInput = this.page.locator('input[name="email"], [data-testid="shipping-email-input"], [data-testid="email-input"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await emailInput.isVisible()) {
        await emailInput.fill(email);
      }
    }

    const firstNameInput = this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').first();
    await firstNameInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(address.firstName);
    }

    const lastNameInput = this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(address.lastName);
    }

    const addressInput = this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill(address.address1);
    }

    const cityInput = this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').first();
    if (await cityInput.isVisible()) {
      await cityInput.fill(address.city);
    }

    const postalCodeInput = this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code-input"], [data-testid="shipping-postal-input"]').first();
    if (await postalCodeInput.isVisible()) {
      await postalCodeInput.fill(address.postalCode);
    }

    const provinceInput = this.page.locator('input[name="shipping_address.province"], [data-testid="shipping-province-input"]').first();
    if (await provinceInput.count() > 0 && await provinceInput.isVisible()) {
      await provinceInput.fill('Barcelona');
    }

    const phoneInput = this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone-input"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(address.phone);
    }

    const countrySelect = this.page.locator('select[name="shipping_address.country_code"], [data-testid="shipping-country-select"], [data-testid="shipping-country-select"] button').first();
    if (await countrySelect.count() > 0 && await countrySelect.isVisible()) {
      const tagName = await countrySelect.evaluate(el => el.tagName.toLowerCase()).catch(() => 'select');
      if (tagName === 'select') {
        try {
          await countrySelect.selectOption({ index: 1 });
        } catch (e) {
          try {
            await countrySelect.selectOption('es');
          } catch (e2) {
            try {
              await countrySelect.selectOption('us');
            } catch (e3) {}
          }
        }
      } else {
        await countrySelect.click();
        await this.page.waitForTimeout(500);
        const firstOption = this.page.locator('[data-testid="shipping-country-select"] option, [role="option"], ul li').first();
        if (await firstOption.count() > 0) {
          await firstOption.click();
        }
      }
    }
  }

  async saveAddress(): Promise<void> {
    const saveButton = this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Continue to delivery"), button:has-text("Continuar al envío"), button:has-text("Siguiente")').first();
    await saveButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await saveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const summary = this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"], [data-testid="edit-address-button"], button:text-is("Edit"), button:has-text("Edit"), button:text-is("Editar"), button:has-text("Editar")').first();
    await expect(summary).toBeVisible({ timeout: 15000 });
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    const addDiscountBtn = this.page.locator('[data-testid="add-discount-button"], button:has-text("Gift card or discount code"), button:has-text("Add"), button:has-text("Agregar código de descuento"), button:has-text("Código de descuento")').first();
    if (await addDiscountBtn.count() > 0 && await addDiscountBtn.isVisible()) {
      await addDiscountBtn.click();
      await this.page.waitForTimeout(500);
    }
    
    const promoInput = this.page.locator('input[name="code"], [data-testid="discount-input"], [data-testid="promo-input"]').first();
    await promoInput.waitFor({ state: 'visible' });
    await promoInput.fill(code);

    const applyBtn = this.page.locator('button:has-text("Apply"), button:has-text("Aplicar"), [data-testid="discount-button"], [data-testid="apply-promo-button"]').first();
    await applyBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const discountRow = this.page.locator(`[data-testid="discount-row"], [data-testid="cart-discount"], [data-testid="applied-promo"], :text-is("${code}"), :has-text("${code}"), [data-testid="active-discounts"]`).first();
    await expect(discountRow).toBeVisible({ timeout: 15000 });
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="discount-row"], [data-testid="active-discounts"]').first();
    await expect(discountAmount).toBeVisible({ timeout: 15000 });
  }

  async expectUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring));
  }
}
