import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
    await this.page.waitForTimeout(1500);
    if (this.page.url().includes('/cart')) {
      const checkoutBtn = this.page.locator('[data-testid="checkout-button"], button:has-text("Checkout"), button:has-text("Ir a la caja")');
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
      } else {
        await this.goto('/checkout');
      }
    }
  }

  async fillShippingAddress(first: string, last: string, address: string, city: string, postal: string, phone: string): Promise<void> {
    await this.page.locator('[data-testid="shipping-first-name-input"], #shipping-first_name, input[name*="shipping_address.first_name"], input[name*="first_name"]').first().fill(first);
    await this.page.locator('[data-testid="shipping-last-name-input"], #shipping-last_name, input[name*="shipping_address.last_name"], input[name*="last_name"]').first().fill(last);
    await this.page.locator('[data-testid="shipping-address-input"], #shipping-address, input[name*="shipping_address.address_1"], input[name*="address_1"]').first().fill(address);
    await this.page.locator('[data-testid="shipping-city-input"], #shipping-city, input[name*="shipping_address.city"], input[name*="city"]').first().fill(city);
    await this.page.locator('[data-testid="shipping-postal-code-input"], #shipping-postal_code, input[name*="shipping_address.postal_code"], input[name*="postal_code"]').first().fill(postal);
    await this.page.locator('[data-testid="shipping-phone-input"], #shipping-phone, input[name*="shipping_address.phone"], input[name*="phone"]').first().fill(phone);

    const countrySelect = this.page.locator('[data-testid="shipping-country-select"], select[name*="country_code"]');
    if (await countrySelect.isVisible()) {
      try {
        const options = await countrySelect.locator('option').all();
        if (options.length > 1) {
          await countrySelect.selectOption({ index: 1 });
        } else {
          await countrySelect.selectOption({ index: 0 });
        }
      } catch (e) {}
    }
    const provinceSelect = this.page.locator('[data-testid="shipping-province-select"], select[name*="province"]');
    if (await provinceSelect.isVisible()) {
      try {
        await provinceSelect.selectOption({ index: 1 });
      } catch (e) {}
    }
    const provinceInput = this.page.locator('[data-testid="shipping-province-input"], [data-testid="shipping-state-input"], input[name*="province"]');
    if (await provinceInput.isVisible()) {
      await provinceInput.fill('FL');
    }
  }

  async fillBillingAddress(first: string, last: string, address: string, city: string, postal: string): Promise<void> {
    const checkbox = this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], #billing-same-as-shipping, [data-testid="billing-address-checkbox"], input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.click();
        await this.page.waitForTimeout(500);
      }
    }
    const billingFirst = this.page.locator('[data-testid="billing-first-name-input"], #billing-first_name, input[name*="billing_address.first_name"]').first();
    if (await billingFirst.isVisible()) {
      await billingFirst.fill(first);
      await this.page.locator('[data-testid="billing-last-name-input"], #billing-last_name, input[name*="billing_address.last_name"]').first().fill(last);
      await this.page.locator('[data-testid="billing-address-input"], #billing-address, input[name*="billing_address.address_1"]').first().fill(address);
      await this.page.locator('[data-testid="billing-city-input"], #billing-city, input[name*="billing_address.city"]').first().fill(city);
      await this.page.locator('[data-testid="billing-postal-code-input"], #billing-postal_code, input[name*="billing_address.postal_code"]').first().fill(postal);

      const countrySelect = this.page.locator('[data-testid="billing-country-select"], select[name*="billing_address.country_code"]');
      if (await countrySelect.isVisible()) {
        try {
          const options = await countrySelect.locator('option').all();
          if (options.length > 1) {
            await countrySelect.selectOption({ index: 1 });
          } else {
            await countrySelect.selectOption({ index: 0 });
          }
        } catch (e) {}
      }
      const provinceSelect = this.page.locator('[data-testid="billing-province-select"], select[name*="province"]');
      if (await provinceSelect.isVisible()) {
        try {
          await provinceSelect.selectOption({ index: 1 });
        } catch (e) {}
      }
      const provinceInput = this.page.locator('[data-testid="billing-province-input"], [data-testid="billing-state-input"], input[name*="province"]');
      if (await provinceInput.isVisible()) {
        await provinceInput.fill('FL');
      }
    }
  }

  async fillEmail(email: string): Promise<void> {
    const input = this.page.locator('[data-testid="shipping-email-input"], [data-testid="email-input"], input[type="email"], input[name*="email"]').first();
    await input.fill(email);
  }

  async saveAddressDetails(): Promise<void> {
    const btn = this.page.locator('[data-testid="submit-address-button"], [data-testid="save-address-button"], button:has-text("Save address"), button:has-text("Submit"), button[type="submit"]');
    await btn.first().click();
    await this.page.waitForTimeout(1000);
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    await expect(this.page.locator('[data-testid="address-summary"], .address-saved-indicator, button:has-text("Edit"), button:has-text("Delivery"), [data-testid="submit-delivery-option-button"]').first()).toBeVisible({ timeout: 15000 });
  }

  async enterPromoCode(code: string): Promise<void> {
    const inputLocator = this.page.locator('[data-testid="discount-input"], [data-testid="gift-card-input"], [data-testid="promo-code-input"], input[placeholder*="Promo"], input[placeholder*="Discount"]');
    if (!(await inputLocator.isVisible())) {
      const toggleButton = this.page.locator('[data-testid="add-discount-button"], button:has-text("Gift Card"), button:has-text("Discount"), button:has-text("Promo"), button:has-text("Código"), button:has-text("Descuento")');
      if (await toggleButton.isVisible()) {
        await toggleButton.first().click();
        await this.page.waitForTimeout(500);
      }
    }
    await inputLocator.first().fill(code);
  }

  async applyPromoCode(): Promise<void> {
    await this.page.locator('[data-testid="discount-button"], [data-testid="submit-discount-button"], [data-testid="apply-promo-button"], button:has-text("Apply"), button:has-text("Aplicar"), button:has-text("Submit")').first().click();
    await this.page.waitForTimeout(1000);
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="active-discount-code"], [data-testid="discount-code"], [data-testid="applied-promo"], :has-text("${code}"), .applied-promo-tag`).first()).toBeVisible({ timeout: 15000 });
  }

  async expectTotalsRefreshed(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], .discount-amount, :has-text("Discount"), :has-text("Descuento"), :has-text("-")').first()).toBeVisible({ timeout: 15000 });
  }

  async expectUrlContains(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path), { timeout: 10000 });
  }
}
