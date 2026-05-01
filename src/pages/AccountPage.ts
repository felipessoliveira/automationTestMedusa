import { Page, expect, Locator } from '@playwright/test';
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

  async open(): Promise<void> {
    await this.goto('/account');
    // Account page is a React client island inside RSC — give hydration a
    // moment before the register-toggle click registers state changes.
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async openForDeviceType(deviceType: string): Promise<void> {
    await this.setViewportForDeviceType(deviceType);
    await this.open();
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

  async submitLoginForm(): Promise<void> {
    const button = this.signInButton();
    await expect(button).toBeVisible({ timeout: 10_000 });
    await expect(button).toBeEnabled({ timeout: 10_000 });
    await button.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillLoginCredentials(email, password);
    await this.submitLoginForm();
  }

  async expectLoggedIn(): Promise<void> {
    // After a successful auth, the login/register form unmounts: no more
    // email-input. If an auth error occurs, the input stays visible — so
    // this will (correctly) fail rather than false-pass.
    await expect(this.emailInput()).toBeHidden({ timeout: 15_000 });
  }

  async expectLoginPageVisualConsistency(): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
    await this.expectNoHorizontalOverflow();
  }

  async expectLoginControlsDisplayedWithoutOverlap(): Promise<void> {
    const emailBox = await this.expectVisibleControl(this.emailInput(), 'email input');
    const passwordBox = await this.expectVisibleControl(this.passwordInput(), 'password input');
    const buttonBox = await this.expectVisibleControl(this.signInButton(), 'sign in button');

    expect(this.boxesOverlap(emailBox, passwordBox), 'email and password inputs should not overlap').toBeFalsy();
    expect(this.boxesOverlap(passwordBox, buttonBox), 'password input and sign in button should not overlap').toBeFalsy();
    expect(Math.abs(emailBox.x - passwordBox.x), 'email and password inputs should remain aligned').toBeLessThanOrEqual(16);
  }

  async expectResponsiveLoginPage(): Promise<void> {
    const originalViewport = this.page.viewportSize();
    const deviceTypes = ['Desktop', 'Tablet', 'Mobile'];

    try {
      for (const deviceType of deviceTypes) {
        await this.openForDeviceType(deviceType);
        await this.expectLoginPageVisualConsistency();
        await this.expectLoginControlsDisplayedWithoutOverlap();
      }
    } finally {
      if (originalViewport) {
        await this.page.setViewportSize(originalViewport);
        await this.open();
      }
    }
  }

  async expectLoginFormAccessibleToScreenReaders(): Promise<void> {
    await expect(this.page.getByLabel(/email/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByLabel(/password/i)).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
  }

  async expectValidationMessageVisible(): Promise<void> {
    await expect
      .poll(
        async () => {
          for (const candidate of this.validationMessageCandidates()) {
            const count = await candidate.count().catch(() => 0);
            for (let i = 0; i < count; i++) {
              const message = candidate.nth(i);
              if (await message.isVisible().catch(() => false)) {
                return ((await message.textContent().catch(() => '')) ?? 'visible').trim() || 'visible';
              }
            }
          }
          return '';
        },
        { timeout: 15_000 },
      )
      .toMatch(/.+/);
  }

  private async setViewportForDeviceType(deviceType: string): Promise<void> {
    const normalized = deviceType.trim().toLowerCase();
    const size =
      normalized === 'mobile'
        ? { width: 390, height: 844 }
        : normalized === 'tablet'
          ? { width: 768, height: 1024 }
          : { width: 1440, height: 900 };

    await this.page.setViewportSize(size);
  }

  private async expectVisibleControl(locator: Locator, name: string): Promise<{ x: number; y: number; width: number; height: number }> {
    await expect(locator, `${name} should be visible`).toBeVisible({ timeout: 10_000 });
    const box = await locator.boundingBox();
    if (!box) throw new Error(`${name} did not render a bounding box`);

    expect(box.width, `${name} should have width`).toBeGreaterThan(0);
    expect(box.height, `${name} should have height`).toBeGreaterThan(0);
    expect(box.x, `${name} should stay inside the viewport`).toBeGreaterThanOrEqual(0);

    const viewport = this.page.viewportSize();
    if (viewport) {
      expect(box.x + box.width, `${name} should not overflow the viewport`).toBeLessThanOrEqual(viewport.width + 1);
    }

    return box;
  }

  private boxesOverlap(
    first: { x: number; y: number; width: number; height: number },
    second: { x: number; y: number; width: number; height: number },
  ): boolean {
    const horizontalOverlap = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const verticalOverlap = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    return horizontalOverlap * verticalOverlap > 0;
  }

  private async expectNoHorizontalOverflow(): Promise<void> {
    const hasHorizontalOverflow = await this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow, 'login page should not have broken horizontal overflow').toBeFalsy();
  }

  private validationMessageCandidates(): Locator[] {
    return [
      this.page.locator('[data-testid="login-error-message"]'),
      this.page.locator('[role="alert"]'),
      this.page.getByText(/invalid|incorrect|error|failed|required|credentials/i),
    ];
  }
}
