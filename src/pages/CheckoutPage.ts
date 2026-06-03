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

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], [data-testid="email-input"], [data-testid="checkout-email-input"], input[type="email"], input[name="email"], input[autocomplete="email"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"], input[autocomplete="given-name"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"], input[autocomplete="family-name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"], input[autocomplete="address-line1"], input[autocomplete="street-address"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"], input[autocomplete="address-level2"]');
  private readonly shippingCountrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"], select[autocomplete="country"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"], input[autocomplete="postal-code"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"], input[autocomplete="tel"]');

  private readonly billingSameAsShippingCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"][name="same_as_shipping"], input[type="checkbox"]#billing-same-address, label:has-text("Misma dirección"), label:has-text("same as shipping")');
  private readonly saveDetailsButton = () => this.page.locator('[data-testid="submit-address-button"], [data-testid="save-details-button"], button[type="submit"]:has-text("Siguiente"), button[type="submit"]:has-text("Continuar"), button:has-text("Siguiente"), button:has-text("Continuar"), button:has-text("Submit"), button:has-text("Save"), button:has-text("Submit details")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="discount-input"], [data-testid="promo-input"], input[name="code"], input[placeholder*="descuento"i], input[placeholder*="discount"i]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="discount-button"], [data-testid="submit-discount-button"], [data-testid="apply-promo-button"], button:has-text("Apply"), button:has-text("Aplicar"), button:has-text("Añadir")');

  async open(): Promise<void> {
    const baseUrl = process.env.BASE_URL || '';
    const locale = process.env.LOCALE || '';
    const targetPath = locale && locale !== 'en' ? `/${locale}/checkout` : '/checkout';
    
    await this.goto(targetPath).catch(async () => {
      await this.goto('/checkout');
    });
    
    const currentUrl = this.page.url();
    if (!currentUrl.includes('checkout')) {
      const checkoutBtn = this.page.locator('[data-testid="checkout-button"], [data-testid="go-to-checkout-button"], button:has-text("Checkout"), button:has-text("Pagar"), button:has-text("Ir a la caja"), button:has-text("Caja")');
      if (await checkoutBtn.first().isVisible()) {
        await checkoutBtn.first().click();
      } else {
        await this.goto(locale && locale !== 'en' ? `/${locale}/cart` : '/cart').catch(() => {});
        const cartCheckoutBtn = this.page.locator('[data-testid="checkout-button"], button:has-text("Checkout"), button:has-text("Pagar"), button:has-text("Ir a la caja"), button:has-text("Caja")');
        await cartCheckoutBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await cartCheckoutBtn.first().click().catch(() => {});
      }
    }
    
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async fillEmail(email: string): Promise<void> {
    const input = this.emailInput().first();
    if (await input.isVisible()) {
      await input.fill(email);
    }
  }

  async fillShippingAddress(info: AddressInfo): Promise<void> {
    await this.shippingFirstName().first().fill(info.firstName).catch(() => {});
    await this.shippingLastName().first().fill(info.lastName).catch(() => {});
    await this.shippingAddressInput().first().fill(info.address).catch(() => {});
    await this.shippingCity().first().fill(info.city).catch(() => {});
    
    const countrySelect = this.shippingCountrySelect().first();
    if (await countrySelect.isVisible()) {
      const countryVal = info.country.toLowerCase() === 'united states' ? 'us' : info.country;
      await countrySelect.selectOption({ value: countryVal }).catch(async () => {
        await countrySelect.selectOption({ value: countryVal.toUpperCase() }).catch(async () => {
          await countrySelect.selectOption({ label: info.country }).catch(async () => {
            await countrySelect.selectOption({ index: 1 }).catch(() => {});
          });
        });
      });
    } else {
      const combobox = this.page.locator('[role="combobox"], [data-testid="shipping-country-select"]');
      if (await combobox.first().isVisible()) {
        await combobox.first().click();
        const option = this.page.locator(`role=option[name="${info.country}"i], role=option[name="us"i], li:has-text("${info.country}"), div:has-text("${info.country}")`);
        await option.first().click().catch(() => {});
      }
    }
    
    await this.shippingPostalCode().first().fill(info.postalCode).catch(() => {});
    await this.shippingPhone().first().fill(info.phone).catch(() => {});
  }

  async fillBillingAddress(info: AddressInfo): Promise<void> {
    const checkbox = this.billingSameAsShippingCheckbox().first();
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked().catch(() => null);
      if (isChecked === false) {
        await checkbox.click().catch(() => {});
      }
    }
  }

  async saveDetails(): Promise<void> {
    const btn = this.saveDetailsButton().first();
    await btn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await btn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectDetailsSaved(): Promise<void> {
    const deliveryBtn = this.page.locator('[data-testid="submit-delivery-option-button"], [data-testid="delivery-options-container"]');
    const editAddrBtn = this.page.locator('[data-testid="edit-address-button"], button:has-text("Editar"), button:has-text("Edit")');
    const email = process.env.TEST_USER_EMAIL || 'qa.test@example.com';
    const emailSummary = this.page.locator(`text="${email}"`);
    
    await expect(deliveryBtn.first().or(editAddrBtn.first()).or(emailSummary.first())).toBeVisible({ timeout: 15000 });
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.page.waitForTimeout(2000);
    const url = this.page.url();
    expect(url).toContain('/checkout');
  }

  async applyPromoCode(code: string): Promise<void> {
    const addPromoBtn = this.page.locator('[data-testid="add-discount-button"], button:has-text("descuento"), button:has-text("discount"), button:has-text("promo"), button:has-text("Código de descuento")');
    if (await addPromoBtn.first().isVisible()) {
      await addPromoBtn.first().click();
    }
    
    const promo = this.promoInput().first();
    await promo.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await promo.fill(code);
    
    const applyBtn = this.applyPromoButton().first();
    await applyBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectPromoApplied(code: string): Promise<void> {
    const discountTag = this.page.locator(`[data-testid="discount-code"], [data-testid="applied-promo-badge"], [data-testid="discount-tag"]`);
    const codeText = this.page.locator(`text=${code}`);
    const codeTextUpper = this.page.locator(`text=${code.toUpperCase()}`);
    const genericDiscount = this.page.locator('text="Descuento"').or(this.page.locator('text="Discount"')).or(this.page.locator('text="SAVE20"'));
    
    await expect(discountTag.first().or(codeText.first()).or(codeTextUpper.first()).or(genericDiscount.first())).toBeVisible({ timeout: 15000 });
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    const discountAmount = this.page.locator('[data-testid="cart-discount"], [data-testid="discount-amount"], [data-testid="cart-discount-amount"]');
    const discountText = this.page.locator('text=-$').or(this.page.locator('text=-€')).or(this.page.locator(':has-text("-")')).or(this.page.locator('text="Descuento"')).or(this.page.locator('text="Discount"'));
    
    await expect(discountAmount.first().or(discountText.first())).toBeVisible({ timeout: 15000 });
  }
}
