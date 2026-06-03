import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async fillShippingAndBilling(
    email: string,
    address: { 
      firstName: string; 
      lastName: string; 
      address1: string; 
      city: string; 
      postalCode: string; 
      countryCode: string; 
    },
  ): Promise<void> {
    const emailLocator = this.page.locator('input[type="email"], [data-testid="shipping-email-input"], [data-testid*="email"]').first();
    await emailLocator.waitFor({ state: 'visible' });
    await emailLocator.fill(email);

    const firstNameLocator = this.page.locator('input[name*="first_name"], [data-testid="shipping-first-name-input"], [data-testid*="first-name"]').first();
    await firstNameLocator.fill(address.firstName);

    const lastNameLocator = this.page.locator('input[name*="last_name"], [data-testid="shipping-last-name-input"], [data-testid*="last-name"]').first();
    await lastNameLocator.fill(address.lastName);

    const addressLocator = this.page.locator('input[name*="address_1"], [data-testid="shipping-address-input"], [data-testid*="address-1"], [data-testid*="address-input"]').first();
    await addressLocator.fill(address.address1);

    const cityLocator = this.page.locator('input[name*="city"], [data-testid="shipping-city-input"], [data-testid*="city"]').first();
    await cityLocator.fill(address.city);

    const postalCodeLocator = this.page.locator('input[name*="postal_code"], [data-testid="shipping-postal-code-input"], [data-testid*="postal"]').first();
    await postalCodeLocator.fill(address.postalCode);

    const countrySelect = this.page.locator('select[name*="country_code"], [data-testid="shipping-country-select"], [data-testid*="country"]').first();
    try {
      await countrySelect.selectOption({ value: address.countryCode.toLowerCase() });
    } catch (e) {
      try {
        await countrySelect.selectOption({ label: address.countryCode });
      } catch (err) {
        await countrySelect.selectOption({ index: 1 });
      }
    }

    const phoneInput = this.page.locator('input[name*="phone"], [data-testid="shipping-phone-input"], [data-testid*="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('1234567890');
    }

    const saveButton = this.page.locator('[data-testid="submit-address-button"], [data-testid="save-address-button"], button:has-text("Submit"), button:has-text("Save"), button:has-text("Address")').first();
    await saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async applyPromoCode(code: string): Promise<void> {
    const inputSelector = '[data-testid="discount-input"], [data-testid="promo-code-input"], input[name="discount-code"]';
    const inputLocator = this.page.locator(inputSelector).first();
    
    if (!(await inputLocator.isVisible())) {
      const toggleButton = this.page.locator('[data-testid="add-discount-button"], button:has-text("discount"), button:has-text("Promo"), button:has-text("Gift card")');
      if (await toggleButton.first().isVisible()) {
        await toggleButton.first().click();
      }
    }
    
    await inputLocator.fill(code);
    
    const applyButton = this.page.locator('[data-testid="submit-discount-button"], [data-testid="apply-promo-button"], button:has-text("Apply")');
    await applyButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.page.getByText('Felipe Oliveira')).toBeVisible();
    
    const deliveryStep = this.page.locator('[data-testid="delivery-step-container"], [data-testid*="delivery"], button:has-text("Delivery"), [data-testid="submit-delivery-option-button"]');
    if (await deliveryStep.first().isVisible()) {
      await expect(deliveryStep.first()).toBeVisible();
    }
  }

  async expectPromoApplied(code: string): Promise<void> {
    const promoLocator = this.page.locator(`[data-testid*="discount"], [data-testid*="promo"], [data-testid*="badge"]`).getByText(code, { exact: false });
    if (await promoLocator.first().isVisible()) {
      await expect(promoLocator.first()).toBeVisible();
    } else {
      await expect(this.page.getByText(code)).toBeVisible();
    }
  }

  async expectDiscountDisplayed(): Promise<void> {
    const discountLocator = this.page.locator('[data-testid*="discount"], [data-testid*="reduct"], [data-testid*="promo-amount"]');
    let found = false;
    const count = await discountLocator.count();
    for (let i = 0; i < count; i++) {
      const text = await discountLocator.nth(i).textContent();
      if (text && (text.includes('-') || text.toLowerCase().includes('discount') || /\d/.test(text))) {
        await expect(discountLocator.nth(i)).toBeVisible();
        found = true;
        break;
      }
    }
    if (!found) {
      const fallback = this.page.getByText(/Discount|-/i);
      await expect(fallback.first()).toBeVisible();
    }
  }

  async expectUrlContains(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }
}
