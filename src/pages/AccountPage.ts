import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors target the stable data-testid attributes used by the
  // medusajs/nextjs-starter-medusa login/register forms.
  private readonly emailInput = () => this.page.locator('[data-testid="email-input"]');
  private readonly passwordInput = () => this.page.locator('[data-testid="password-input"]');
  private readonly firstNameInput = () => this.page.locator('[data-testid="first-name-input"]');
  private readonly lastNameInput = () => this.page.locator('[data-testid="last-name-input"]');
  private readonly phoneInput = () => this.page.locator('[data-testid="phone-input"]');
  private readonly registerToggle = () => this.page.locator('[data-testid="register-button"]');
  private readonly signInButton = () => this.page.getByRole('button', { name: /^sign in$/i });
  private readonly validationMessage = () =>
    this.page.getByText(/invalid|incorrect|wrong|required|error|credentials|email|password/i).first();

  async open(): Promise<void> {
    await this.goto('/account');
    // Account page is a React client island inside RSC — give hydration a
    // moment before the register-toggle click registers state changes.
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToRegister(): Promise<void> {
    const toggle = this.registerToggle();
    await expect(toggle).toBeVisible({ timeout: 10_000 });
    await toggle.click();
    await expect(this.firstNameInput()).toBeVisible({ timeout: 10_000 });
  }

  async register(payload: RegisterPayload): Promise<void> {
    await this.goToRegister();
    await this.firstNameInput().fill(payload.first_name);
    await this.lastNameInput().fill(payload.last_name);
    await this.emailInput().fill(payload.email);
    if (payload.phone) {
      const phone = this.phoneInput();
      if (await phone.isVisible().catch(() => false)) await phone.fill(payload.phone);
    }
    await this.passwordInput().fill(payload.password);
    await this.page.getByRole('button', { name: /^join$/i }).click();
  }

  async fillLoginCredentials(email: string, password: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
  }

  async submitLogin(): Promise<void> {
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
    await this.signInButton().click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillLoginCredentials(email, password);
    await this.submitLogin();
  }

  async expectLoggedIn(): Promise<void> {
    // After a successful auth, the login/register form unmounts: no more
    // email-input. If an auth error occurs, the input stays visible — so
    // this will (correctly) fail rather than false-pass.
    await expect(this.emailInput()).toBeHidden({ timeout: 15_000 });
  }

  async expectLoginPageReady(): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
  }

  async expectCssFrameworkV5Only(): Promise<void> {
    const assets = await this.page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          'link[rel~="stylesheet"], script[src], meta[name*="css"], meta[name*="framework"], [data-css-framework], [data-framework-version]',
        ),
      ).map((element) => {
        const htmlElement = element as HTMLElement;
        return [
          (element as HTMLLinkElement).href || '',
          (element as HTMLScriptElement).src || '',
          element.getAttribute('content') || '',
          element.getAttribute('data-css-framework') || '',
          element.getAttribute('data-framework-version') || '',
          htmlElement.id || '',
          typeof htmlElement.className === 'string' ? htmlElement.className : '',
        ].join(' ');
      }),
    );

    const hasFrameworkVersion = (major: number) =>
      assets.some(
        (asset) =>
          /(bootstrap|css[-_\s]?framework|framework)/i.test(asset) &&
          new RegExp(`(^|[^\\d])v?${major}\\.\\d`, 'i').test(asset),
      );

    expect(
      hasFrameworkVersion(5),
      `Expected login page assets to reference CSS Framework v5.x. Assets: ${JSON.stringify(assets)}`,
    ).toBeTruthy();
    expect(
      hasFrameworkVersion(3),
      `Expected login page assets not to reference CSS Framework v3.x. Assets: ${JSON.stringify(assets)}`,
    ).toBeFalsy();
  }

  async expectLoginFormLayoutAndAccessibility(): Promise<void> {
    await this.expectLoginPageReady();

    await expect(this.emailInput()).toHaveAccessibleName(/email|username/i);
    await expect(this.passwordInput()).toHaveAccessibleName(/password/i);
    await expect(this.signInButton()).toHaveAccessibleName(/sign in|log in|submit/i);

    await this.expectNoVisualOverlap([
      { name: 'username/email field', locator: this.emailInput() },
      { name: 'password field', locator: this.passwordInput() },
      { name: 'submit button', locator: this.signInButton() },
    ]);
  }

  async submitInvalidLoginForValidation(): Promise<void> {
    await this.fillLoginCredentials(`qa.invalid.${Date.now()}@example.com`, 'InvalidPassword123!');
    await this.submitLogin();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectValidationMessageVisible(): Promise<void> {
    await expect(this.validationMessage()).toBeVisible({ timeout: 15_000 });
  }

  async expectValidationMessageVisualAndAccessible(): Promise<void> {
    await this.expectValidationMessageVisible();

    await this.expectNoVisualOverlap([
      { name: 'validation message', locator: this.validationMessage() },
      { name: 'username/email field', locator: this.emailInput() },
      { name: 'password field', locator: this.passwordInput() },
      { name: 'submit button', locator: this.signInButton() },
    ]);

    const accessible = await this.page.evaluate(() => {
      const pattern = /invalid|incorrect|wrong|required|error|credentials|email|password/i;
      const elements = Array.from(document.querySelectorAll('body *')).filter((element) => {
        const htmlElement = element as HTMLElement;
        const text = htmlElement.innerText || htmlElement.textContent || '';
        return pattern.test(text) && htmlElement.offsetParent !== null;
      });

      return elements.some((element) => {
        const htmlElement = element as HTMLElement;
        return Boolean(
          htmlElement.closest('[role="alert"], [role="status"], [aria-live]') ||
            htmlElement.getAttribute('role') ||
            htmlElement.getAttribute('aria-live') ||
            htmlElement.id,
        );
      });
    });

    expect(accessible, 'Expected the login validation message to be available to assistive technologies').toBeTruthy();
  }

  private async expectNoVisualOverlap(items: { name: string; locator: Locator }[]): Promise<void> {
    const viewport = this.page.viewportSize();
    const boxes: { name: string; box: { x: number; y: number; width: number; height: number } }[] = [];

    for (const item of items) {
      const box = await item.locator.first().boundingBox();
      expect(box, `${item.name} should have a rendered bounding box`).toBeTruthy();
      if (!box) continue;
      expect(box.width, `${item.name} should render with width`).toBeGreaterThan(0);
      expect(box.height, `${item.name} should render with height`).toBeGreaterThan(0);

      if (viewport) {
        expect(box.x + box.width, `${item.name} should fit within the viewport width`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        expect(box.y + box.height, `${item.name} should fit within the viewport height`).toBeLessThanOrEqual(
          viewport.height + 1,
        );
      }

      boxes.push({ name: item.name, box });
    }

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlapWidth = Math.max(
          0,
          Math.min(a.box.x + a.box.width, b.box.x + b.box.width) - Math.max(a.box.x, b.box.x),
        );
        const overlapHeight = Math.max(
          0,
          Math.min(a.box.y + a.box.height, b.box.y + b.box.height) - Math.max(a.box.y, b.box.y),
        );
        const overlapArea = overlapWidth * overlapHeight;
        expect(overlapArea, `${a.name} should not overlap ${b.name}`).toBeLessThanOrEqual(1);
      }
    }
  }
}
