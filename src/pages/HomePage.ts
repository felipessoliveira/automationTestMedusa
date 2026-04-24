import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly productCards = () =>
    this.page.locator('[data-testid="product-wrapper"], a[href*="/products/"]');

  async open(): Promise<void> {
    await this.goto('/store');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openFirstProduct(): Promise<string> {
    const first = this.productCards().first();
    await expect(first).toBeVisible();
    const href = await first.getAttribute('href');
    await first.click();
    return href ?? '';
  }

  async openProductByName(name: string): Promise<void> {
    const card = this.page.getByRole('link', { name: new RegExp(name, 'i') }).first();
    await expect(card, `No product card matched "${name}"`).toBeVisible();
    await card.click();
  }
}
