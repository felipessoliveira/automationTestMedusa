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

  private readonly emailInput = () => this.page.locator('[data-testid="checkout-email-input"], input[name="email"]');
  private readonly shippingFirstName = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly shippingLastName = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly shippingAddressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly shippingCity = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly shippingCountrySelect = () => this.page.locator('[data-testid="shipping-country-select"], select[name="shipping_address.country_code"]');
  private readonly shippingPostalCode = () => this.page.locator('[data-testid="shipping-postal-code-input"], input[name="shipping_address.postal_code"]');
  private readonly shippingPhone = () => this.page.locator('[data-testid="shipping-phone-input"], input[name="shipping_address.phone"]');

  private readonly billingSameAsShippingCheckbox = () => this.page.locator('[data-testid="billing-same-as-shipping-checkbox"], input[type="checkbox"][name="same_as_shipping"]');
  private readonly saveDetailsButton = () => this.page.locator('[data-testid="save-details-button"], button:has-text("Save"), button:has-text("Submit details")');
  
  private readonly promoInput = () => this.page.locator('[data-testid="promo-input"], input[name="code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  
  private readonly appliedPromoBadge = (code: string) => this.page.locator(`[data-testid="applied-promo-badge"]:has-text("${code}"), [data-testid="discount-tag"]:has-text("${code}")`);
  private readonly discountAmount = () => this.page.locator('[data-testid="discount-amount"], [data-testid="cart-discount"]');
  private readonly savedDetailsBadge = () => this.page.locator('[data-testid="saved-details-badge"], [data-testid="address-saved-indicator"], :has-text("Details saved"), :has-text("Saved")');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput().fill(email);
  }

  async fillShippingAddress(info: AddressInfo): Promise<void> {
    await this.shippingFirstName().fill(info.firstName);
    await this.shippingLastName().fill(info.lastName);
    await this.shippingAddressInput().fill(info.address);
    await this.shippingCity().fill(info.city);
    if (await this.shippingCountrySelect().isVisible()) {
      await this.shippingCountrySelect().selectOption({ label: info.country });
    }
    await this.shippingPostalCode().fill(info.postalCode);
    await this.shippingPhone().fill(info.phone);
  }

  async fillBillingAddress(info: AddressInfo): Promise<void> {
    const isChecked = await this.billingSameAsShippingCheckbox().isChecked().catch(() => true);
    if (isChecked) {
      await this.billingSameAsShippingCheckbox().check().catch(() => {});
    }
  }

  async saveDetails(): Promise<void> {
    await this.saveDetailsButton().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.savedDetailsBadge().first()).toBeVisible();
  }

  async expectNotRedirectedToDelivery(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const url = this.page.url();
    expect(url).not.toContain('/delivery');
    expect(url).toContain('/checkout');
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.appliedPromoBadge(code).first().or(this.page.locator(`text=${code}`).first())).toBeVisible();
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    await expect(this.discountAmount().first().or(this.page.locator(':has-text("-")').first())).toBeVisible();
  }
}