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
      const name = (await row.locator('[data-testid="product-title"], a[href*="/products/"]').first().textContent())?.trim() ?? '';
      const qtyText =
        (await row.locator('[data-testid="product-quantity"], input[name*="quantity"]').first().inputValue().catch(() => '')) ||
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
}
