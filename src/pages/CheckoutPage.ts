import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBillingAddress(email: string, address: { firstName: string; lastName: string; address1: string; city: string; postalCode: string; phone: string }): Promise<void> {
    const emailInput = this.page.locator('input[name="email"], [data-testid="shipping-email-input"], [data-testid="email-input"]').first();
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(email);

    await this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').first().fill(address.firstName);
    await this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').first().fill(address.lastName);
    await this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').first().fill(address.address1);
    await this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').first().fill(address.city);
    await this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code-input"], [data-testid="shipping-postal-input"]').first().fill(address.postalCode);
    await this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone-input"]').first().fill(address.phone);

    const countrySelect = this.page.locator('select[name="shipping_address.country_code"], [data-testid="shipping-country-select"]').first();
    if (await countrySelect.count() > 0 && await countrySelect.isVisible()) {
      try {
        await countrySelect.selectOption({ index: 1 });
      } catch (e) {}
    }
  }

  async saveAddress(): Promise<void> {
    const saveButton = this.page.locator('button:has-text("Save"), [data-testid="submit-address-button"], button:has-text("Submit"), button:has-text("Continue to delivery")').first();
    await saveButton.click();
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const summary = this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"], [data-testid="edit-address-button"], button:has-text("Edit")').first();
    await expect(summary).toBeVisible();
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    const addDiscountBtn = this.page.locator('[data-testid="add-discount-button"], button:has-text("Gift card or discount code"), button:has-text("Add")').first();
    if (await addDiscountBtn.isVisible()) {
      await addDiscountBtn.click();
    }
    
    const promoInput = this.page.locator('input[name="code"], [data-testid="discount-input"], [data-testid="promo-input"]').first();
    await promoInput.waitFor({ state: 'visible' });
    await promoInput.fill(code);

    const applyBtn = this.page.locator('button:has-text("Apply"), [data-testid="discount-button"], [data-testid="apply-promo-button"]').first();
    await applyBtn.click();
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const discountRow = this.page.locator(`[data-testid="discount-row"], [data-testid="cart-discount"], [data-testid="applied-promo"], :text-is("${code}"), :has-text("${code}")`).first();
    await expect(discountRow).toBeVisible();
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="discount-row"]').first();
    await expect(discountAmount).toBeVisible();
  }

  async expectUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring));
  }
}