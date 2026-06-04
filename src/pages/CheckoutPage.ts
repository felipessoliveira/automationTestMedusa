import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/checkout');
    // If the cart was empty or checkout redirected us, handle checkout/cart interaction
    const checkoutBtn = this.page.locator('[data-testid="checkout-button"], [data-testid="go-to-checkout-button"], button:has-text("Ir al pago"), button:has-text("Checkout")').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
    }
    await this.page.waitForURL(url => url.pathname.includes('/checkout'), { timeout: 10000 }).catch(() => {});
  }

  async enterShippingAndBillingAddress(email: string): Promise<void> {
    const emailInput = this.page.locator('input[name="email"], [data-testid="shipping-email-input"]').first();
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill(email);

    const firstName = this.page.locator('input[name="shipping_address.first_name"], [data-testid="shipping-first-name-input"]').first();
    await firstName.fill('Felipe');

    const lastName = this.page.locator('input[name="shipping_address.last_name"], [data-testid="shipping-last-name-input"]').first();
    await lastName.fill('Oliveira');

    const address = this.page.locator('input[name="shipping_address.address_1"], [data-testid="shipping-address-input"]').first();
    await address.fill('123 Test St');

    const city = this.page.locator('input[name="shipping_address.city"], [data-testid="shipping-city-input"]').first();
    await city.fill('Madrid');

    const postalCode = this.page.locator('input[name="shipping_address.postal_code"], [data-testid="shipping-postal-code-input"]').first();
    await postalCode.fill('28001');

    // Handle country select/dropdown
    const countryDropdown = this.page.locator('select[name="shipping_address.country_code"], [data-testid="shipping-country-select"]').first();
    if (await countryDropdown.isVisible()) {
      const tagName = await countryDropdown.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        try {
          await countryDropdown.selectOption({ value: 'es' });
        } catch {
          try {
            await countryDropdown.selectOption({ value: 'us' });
          } catch {
            await countryDropdown.selectOption({ index: 1 });
          }
        }
      } else {
        await countryDropdown.click();
        const option = this.page.locator('li, [role="option"]').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }
    }

    const phoneInput = this.page.locator('input[name="shipping_address.phone"], [data-testid="shipping-phone-input"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('600123456');
    }

    const billingCheckbox = this.page.locator('[data-testid="billing-address-checkbox"], input[type="checkbox"]').first();
    if (await billingCheckbox.isVisible()) {
      const isChecked = await billingCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await billingCheckbox.click().catch(() => {});
      }
    }

    const saveBtn = this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit"), button:has-text("Siguiente"), button:has-text("Ir a entrega")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    
    // Wait for the step or state transition
    await this.page.waitForTimeout(1000);
  }

  async enterAndApplyPromoCode(code: string): Promise<void> {
    const revealButton = this.page.locator('[data-testid="add-discount-button"], button:has-text("Discount"), button:has-text("Código"), button:has-text("Promo"), button:has-text("Tarjeta de regalo")').first();
    if (await revealButton.isVisible()) {
      await revealButton.click();
      await this.page.waitForTimeout(500);
    }
    
    const promoInput = this.page.locator('input[name="code"], input[placeholder*="discount"], input[placeholder*="Discount"], [data-testid="promo-code-input"], [data-testid="discount-input"]').first();
    await promoInput.fill(code);
    
    const applyButton = this.page.locator('[data-testid="apply-promo-button"], [data-testid="discount-button"], button:has-text("Apply"), button:has-text("Aplicar")').first();
    await applyButton.click();
    await this.page.waitForTimeout(1000);
  }

  async expectAddressSavedSuccessfully(): Promise<void> {
    const addressSummary = this.page.locator('[data-testid="shipping-address-summary"], [data-testid="address-summary"], [data-testid="checkout-delivery-step"], button:has-text("Edit"), button:has-text("Editar")').first();
    await expect(addressSummary).toBeVisible({ timeout: 10000 });
  }

  async expectPromoAppliedSuccessfully(code: string): Promise<void> {
    const promoCodeBadge = this.page.locator(`[data-testid="discount-badge"], [data-testid="discount-code"], [data-testid="active-discount"], :has-text("${code}")`).first();
    await expect(promoCodeBadge).toBeVisible({ timeout: 10000 });
  }

  async expectCartTotalsRefreshed(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="cart-discount-amount"], [data-testid="discount-row"]').first();
    await expect(discountAmount).toBeVisible({ timeout: 10000 });
  }

  async expectUrlContains(expected: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expected));
  }
}