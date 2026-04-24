import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly variantOptions = () =>
    this.page.locator('button[data-testid="option-button"]');

  private readonly addToCartButton = () => this.page.locator('[data-testid="add-product-button"]');

  private async readAddToCartState(): Promise<{ text: string; enabled: boolean }> {
    const btn = this.addToCartButton().first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
    const text = (await btn.textContent())?.trim() ?? '';
    const enabled = await btn.isEnabled();
    return { text, enabled };
  }

  async selectFirstAvailableVariant(): Promise<void> {
    const options = this.variantOptions();
    const count = await options.count();
    if (count === 0) return; // product has no variants
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const disabled = await opt.getAttribute('disabled');
      const ariaDisabled = await opt.getAttribute('aria-disabled');
      if (disabled === null && ariaDisabled !== 'true') {
        await opt.click();
        await this.page.waitForTimeout(300);
        return;
      }
    }
  }

  async addToCart(): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.selectFirstAvailableVariant();
    const btn = this.addToCartButton().first();
    const { text: btnText } = await this.readAddToCartState();
    if (/out of stock|agotado/i.test(btnText)) {
      throw new Error(
        `Cannot add to cart — product shows "${btnText}". ` +
          `The demo storefront has no stock configured for this product.`,
      );
    }
    await expect(btn).toBeEnabled({ timeout: 10_000 });
    await btn.click();
    await expect
      .poll(
        async () => {
          const text = (await this.page.textContent('body').catch(() => '')) ?? '';
          const match = text.match(/Cart \((\d+)\)/i);
          return match ? Number(match[1]) : 0;
        },
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);
  }

  async canAddToCart(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.selectFirstAvailableVariant();
    const { text: btnText, enabled } = await this.readAddToCartState();
    if (/out of stock|agotado/i.test(btnText)) return false;
    return enabled;
  }

  async getTitle(): Promise<string> {
    const h1 = this.page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    return (await h1.textContent())?.trim() ?? '';
  }
}
