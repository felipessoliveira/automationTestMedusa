import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly shippingAddress = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');
  
  private readonly sameAsBillingCheckbox = () => this.page.locator('[data-testid="billing-address-same-checkbox"], input[type="checkbox"]');
  
  private readonly saveAddressButton = () => this.page.locator('[data-testid="submit-address-button"], button:has-text("Save"), button:has-text("Submit")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly promoApplyButton = () => this.page.locator('[data-testid="promo-apply-button"], button:has-text("Apply")');
  
  private readonly successIndicator = () => this.page.locator('[data-testid="address-summary"], [data-testid="step-completed-shipping"], text=Shipping Address');
  private readonly promoSuccessBadge = () => this.page.locator('[data-testid="applied-promo-badge"], :has-text("SAVE20")');
  private readonly cartTotalElement = () => this.page.locator('[data-testid="cart-total"], [data-testid="cart-summary-total"]');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async enterShippingAndBilling(email: string, firstName: string, lastName: string, address: string, city: string, zip: string, phone: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.shippingFirstName().fill(firstName);
    await this.shippingLastName().fill(lastName);
    await this.shippingAddress().fill(address);
    await this.shippingCity().fill(city);
    await this.shippingPostalCode().fill(zip);
    await this.shippingPhone().fill(phone);
    
    const isChecked = await this.sameAsBillingCheckbox().first().isChecked().catch(() => true);
    if (!isChecked) {
      await this.sameAsBillingCheckbox().first().click();
    }
  }

  async saveAddress(): Promise<void> {
    await this.saveAddressButton().first().click();
  }

  async expectAddressSaved(): Promise<void> {
    await expect(this.successIndicator().first()).toBeVisible({ timeout: 10000 });
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.promoApplyButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.promoSuccessBadge().or(this.page.locator(`text=${code}`)).first()).toBeVisible({ timeout: 10000 });
  }

  async getCartTotal(): Promise<string> {
    const text = await this.cartTotalElement().first().textContent().catch(() => '');
    return text?.trim() || '';
  }

  async expectTotalsRefreshed(previousTotal: string): Promise<void> {
    await expect.poll(async () => {
      const current = await this.getCartTotal();
      return current !== previousTotal && current.length > 0;
    }, { timeout: 10000 }).toBeTruthy();
  }
}

// @EP-9
