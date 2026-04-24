import { Page, expect } from '@playwright/test';
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

  async login(email: string, password: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.page.getByRole('button', { name: /^sign in$/i }).click();
  }

  async expectLoggedIn(): Promise<void> {
    // After a successful auth, the login/register form unmounts: no more
    // email-input. If an auth error occurs, the input stays visible — so
    // this will (correctly) fail rather than false-pass.
    await expect(this.emailInput()).toBeHidden({ timeout: 15_000 });
  }
}
