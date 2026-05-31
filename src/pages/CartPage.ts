import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartLine {
  name: string;
  quantity: number;
}

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly lineItems = () =>
    this.page.locator('[data-testid="product-row"], [data-testid="cart-item"], li[data-cart-line]');

  async open(): Promise<void> {
    await this.goto('/cart');
  }

  async getLineItems(): Promise<CartLine[]> {
    const rows = this.lineItems();
    const n = await rows.count();
    const out: CartLine[] = [];
    for (let i = 0; i < n; i++) {
      const row = rows.nth(i);
      const name =
        (await row.locator('[data-testid="product-title"]').first().textContent().catch(() => ''))?.trim() ||
        (await row.locator('a[href*="/products/"]').first().textContent().catch(() => ''))?.trim() ||
        '';
      const qtyText =
        (await row.locator('[data-testid="product-select-button"], [data-testid="product-quantity"], input[name*="quantity"]').first().inputValue().catch(() => '')) ||
        (await row.locator('[data-testid="product-quantity"], span:has-text("Qty")').first().textContent().catch(() => '')) ||
        '1';
      const qty = Number(qtyText.replace(/\D/g, '')) || 1;
      out.push({ name, quantity: qty });
    }
    return out;
  }

  async expectItem(name: string, quantity = 1): Promise<void> {
    await expect
      .poll(async () => (await this.getLineItems()).some((l) => l.name.toLowerCase().includes(name.toLowerCase()) && l.quantity === quantity), {
        timeout: 15_000,
      })
      .toBeTruthy();
  }

  async enterShippingAddress(): Promise<void> {
    await this.page.locator('[data-testid="shipping-address-1"]').fill('123 Shipping St');
    await this.page.locator('[data-testid="shipping-city"]').fill('Shipping City');
    await this.page.locator('[data-testid="shipping-postal-code"]').fill('12345');
  }

  async saveShippingAddress(): Promise<void> {
    await this.page.locator('[data-testid="save-shipping-address-button"]').click();
  }

  async expectShippingAddressSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-address-saved-badge"]')).toBeVisible();
  }

  async enterBillingAddress(): Promise<void> {
    await this.page.locator('[data-testid="billing-address-1"]').fill('456 Billing Rd');
    await this.page.locator('[data-testid="billing-city"]').fill('Billing City');
    await this.page.locator('[data-testid="billing-postal-code"]').fill('67890');
  }

  async enterEmailAddress(email: string): Promise<void> {
    await this.page.locator('[data-testid="cart-email-input"]').fill(email);
  }

  async saveBillingAddressAndEmail(): Promise<void> {
    await this.page.locator('[data-testid="save-billing-address-button"]').click();
  }

  async expectBillingAddressAndEmailSaved(): Promise<void> {
    await expect(this.page.locator('[data-testid="billing-address-saved-badge"]')).toBeVisible();
  }

  async expectOnCartPage(): Promise<void> {
    await this.expectUrlContains('/cart');
  }
}
