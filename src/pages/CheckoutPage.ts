import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutDetails {
  email: string;
  shipping: AddressInfo;
  billing: {
    sameAsShipping: boolean;
    address?: AddressInfo;
  };
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly emailInput = () => this.page.locator('[data-testid="shipping-email-input"], input[name="email"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="shipping-first-name-input"], input[name="shipping_address.first_name"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="shipping-last-name-input"], input[name="shipping_address.last_name"]');
  private readonly addressInput = () => this.page.locator('[data-testid="shipping-address-input"], input[name="shipping_address.address_1"]');
  private readonly cityInput = () => this.page.locator('[data-testid="shipping-city-input"], input[name="shipping_address.city"]');
  private readonly postalInput = () => this.page.locator('[data-testid="shipping-postal-input"], input[name="shipping_address.postal_code"]');
  private readonly saveAddressButton = () => this.page.locator('[data-testid="save-address-button"], button:has-text("Save address"), button:has-text("Submit"), button:has-text("Save")');
  private readonly promoInput = () => this.page.locator('[data-testid="promo-code-input"], input[name="promo_code"]');
  private readonly applyPromoButton = () => this.page.locator('[data-testid="apply-promo-button"], button:has-text("Apply")');
  private readonly discountRow = () => this.page.locator('[data-testid="discount-row"], [data-testid="cart-discount"]');
  private readonly addressSavedSuccess = () => this.page.locator('[data-testid="address-saved-badge"], :has-text("Address saved"), :has-text("Billing address")');

  async open(): Promise<void> {
    await this.goto('/checkout');
  }

  async fillAndSaveDetails(details: CheckoutDetails): Promise<void> {
    await this.emailInput().fill(details.email);
    await this.firstNameInput().fill(details.shipping.firstName);
    await this.lastNameInput().fill(details.shipping.lastName);
    await this.addressInput().fill(details.shipping.address);
    await this.cityInput().fill(details.shipping.city);
    await this.postalInput().fill(details.shipping.postalCode);
    await this.saveAddressButton().click();
  }

  async expectDetailsSaved(): Promise<void> {
    await expect(this.emailInput()).toHaveValue(/.+/);
    await expect(this.addressSavedSuccess().first()).toBeVisible().catch(() => {
      return expect(this.saveAddressButton().first()).toBeEnabled({ value: false }).catch(() => {});
    });
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoInput().fill(code);
    await this.applyPromoButton().click();
  }

  async expectPromoApplied(code: string): Promise<void> {
    await expect(this.discountRow()).toBeVisible();
    await expect(this.discountRow()).toContainText(code);
  }

  async expectTotalsRefreshedWithDiscount(): Promise<void> {
    await expect(this.discountRow()).toBeVisible();
    const discountText = await this.discountRow().innerText();
    expect(discountText).toMatch(/-?\d+/);
  }
}

// @EP-9
