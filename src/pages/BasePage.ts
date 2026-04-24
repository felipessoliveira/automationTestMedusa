import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected localizedPath(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `/${config.locale}${clean}`;
  }

  protected url(path: string): string {
    return `${config.baseUrl}${this.localizedPath(path)}`;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(this.url(path), { waitUntil: 'domcontentloaded' });
  }

  async expectUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')));
  }
}
