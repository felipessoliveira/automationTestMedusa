import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ProductCandidate {
  name: string;
  href: string;
}

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly productCards = () =>
    this.page.locator('[data-testid="product-wrapper"], a[href*="/products/"]');

  private cleanProductName(text: string): string {
    return text
      .replace(/[$€£]\s*\d[\d.,]*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

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

  async listProducts(): Promise<ProductCandidate[]> {
    const links = this.page.locator('a[href*="/products/"]');
    const count = await links.count();
    const seen = new Set<string>();
    const products: ProductCandidate[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const rawName = (await link.textContent())?.trim().replace(/\s+/g, ' ') ?? '';
      const name = this.cleanProductName(rawName);
      if (!href || seen.has(href) || !name) continue;
      seen.add(href);
      products.push({ href, name });
    }

    return products;
  }

  async openProductByHref(href: string): Promise<void> {
    const target = href.startsWith('http') ? href : new URL(href, this.url('/store')).toString();
    await this.page.goto(target, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
