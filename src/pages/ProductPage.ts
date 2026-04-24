import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly variantOptions = () =>
    this.page.locator('button[data-testid="option-button"]');

  private readonly addToCartButton = () =>
    this.page
      .getByRole('button', { name: /add to cart|añadir al carrito|agregar al carrito/i })
      .or(this.page.locator('[data-testid="add-product-button"]'));

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
        return;
      }
    }
  }

  async addToCart(): Promise<void> {
    await this.selectFirstAvailableVariant();
    const btn = this.addToCartButton().first();
    const btnText = (await btn.textContent())?.trim() ?? '';
    if (/out of stock|agotado/i.test(btnText)) {
      throw new Error(
        `Cannot add to cart — product shows "${btnText}". ` +
          `The demo storefront has no stock configured for this product.`,
      );
    }
    await expect(btn).toBeEnabled({ timeout: 10_000 });
    await btn.click();
  }

  async getTitle(): Promise<string> {
    const h1 = this.page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    return (await h1.textContent())?.trim() ?? '';
  }
}
