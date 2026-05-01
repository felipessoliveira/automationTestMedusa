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
  private readonly loginForm = () => this.emailInput().locator('xpath=ancestor::form[1]');

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
    await this.enterLoginCredentials(email, password);
    await this.submitLoginForm();
  }

  async enterLoginCredentials(email: string, password: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await expect(this.emailInput()).toHaveValue(email);
    await expect(this.passwordInput()).toHaveValue(password);
  }

  async submitLoginForm(): Promise<void> {
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
    await this.signInButton().click();
  }

  async submitLoginFormWithoutCredentials(): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await this.emailInput().fill('');
    await this.passwordInput().fill('');
    await this.submitLoginForm();
  }

  async expectLoginFormReady(): Promise<void> {
    await expect(this.loginForm()).toBeVisible({ timeout: 10_000 });
    await expect(this.emailInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput()).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton()).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton()).toBeEnabled();
  }

  async expectLoginLayoutConsistent(): Promise<void> {
    await this.expectLoginFormReady();

    const formBox = await this.boundingBoxFor('login form', this.loginForm());
    const emailBox = await this.boundingBoxFor('email input', this.emailInput());
    const passwordBox = await this.boundingBoxFor('password input', this.passwordInput());
    const buttonBox = await this.boundingBoxFor('sign in button', this.signInButton());
    const viewport = this.page.viewportSize();

    expect(formBox.width, 'Login form should keep a usable desktop width').toBeGreaterThan(250);
    expect(emailBox.width, 'Email input should keep a usable width').toBeGreaterThan(200);
    expect(passwordBox.width, 'Password input should keep a usable width').toBeGreaterThan(200);
    expect(buttonBox.width, 'Sign in button should keep a usable width').toBeGreaterThan(100);

    if (viewport) {
      for (const [name, box] of [
        ['email input', emailBox],
        ['password input', passwordBox],
        ['sign in button', buttonBox],
      ] as const) {
        expect(box.x, `${name} should not render outside the left viewport edge`).toBeGreaterThanOrEqual(0);
        expect(box.y, `${name} should not render outside the top viewport edge`).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, `${name} should not render outside the right viewport edge`).toBeLessThanOrEqual(
          viewport.width,
        );
      }
    }
  }

  async expectLoginControlsDisplayedWithoutOverlap(): Promise<void> {
    await this.expectLoginFormReady();

    const emailBox = await this.boundingBoxFor('email input', this.emailInput());
    const passwordBox = await this.boundingBoxFor('password input', this.passwordInput());
    const buttonBox = await this.boundingBoxFor('sign in button', this.signInButton());

    expect(emailBox.y, 'Email input should appear above password input').toBeLessThan(passwordBox.y);
    expect(passwordBox.y, 'Password input should appear above sign in button').toBeLessThan(buttonBox.y);
    expect(this.boxesOverlap(emailBox, passwordBox), 'Email and password inputs should not overlap').toBeFalsy();
    expect(this.boxesOverlap(passwordBox, buttonBox), 'Password input and sign in button should not overlap').toBeFalsy();
    expect(this.boxesOverlap(emailBox, buttonBox), 'Email input and sign in button should not overlap').toBeFalsy();

    const emailCenter = emailBox.x + emailBox.width / 2;
    const passwordCenter = passwordBox.x + passwordBox.width / 2;
    const buttonCenter = buttonBox.x + buttonBox.width / 2;
    const tolerance = Math.max(emailBox.width, passwordBox.width, buttonBox.width) * 0.25;

    expect(Math.abs(emailCenter - passwordCenter), 'Email and password inputs should remain aligned').toBeLessThanOrEqual(
      tolerance,
    );
    expect(Math.abs(passwordCenter - buttonCenter), 'Password input and sign in button should remain aligned').toBeLessThanOrEqual(
      tolerance,
    );
  }

  async expectExistingLoginValidationMessage(): Promise<void> {
    await this.page.waitForTimeout(300);

    const nativeValidationMessages = await Promise.all(
      [this.emailInput(), this.passwordInput()].map((input) =>
        input.evaluate((element: HTMLInputElement) => element.validationMessage).catch(() => ''),
      ),
    );

    if (nativeValidationMessages.some((message) => message.trim().length > 0)) return;

    const validationMessage = this.page
      .locator(
        '[role="alert"], [data-testid*="error"], [data-testid*="message"], .text-rose-500, .text-red-500, .text-ui-fg-error',
      )
      .filter({
        hasText: /invalid|required|email|password|credential|credenciais|obrigat|inválid|erro|error/i,
      })
      .first();

    await expect(validationMessage, 'Expected an existing login validation message to be visible').toBeVisible({
      timeout: 10_000,
    });
  }

  async expectLoggedIn(): Promise<void> {
    // After a successful auth, the login/register form unmounts: no more
    // email-input. If an auth error occurs, the input stays visible — so
    // this will (correctly) fail rather than false-pass.
    await expect(this.emailInput()).toBeHidden({ timeout: 15_000 });
  }

  private async boundingBoxFor(name: string, locator: Locator): Promise<NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>> {
    const box = await locator.boundingBox();
    if (!box) throw new Error(`Could not read ${name} bounding box.`);
    return box;
  }

  private boxesOverlap(
    first: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>,
    second: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>,
  ): boolean {
    const horizontalOverlap = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const verticalOverlap = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    return horizontalOverlap > 1 && verticalOverlap > 1;
  }
}
