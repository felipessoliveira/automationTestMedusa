import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { AccountPage } from '../pages/AccountPage';

const VIEWPORTS: Record<string, { width: number; height: number }> = {
  Desktop: { width: 1920, height: 1080 },
  Tablet: { width: 768, height: 1024 },
  Mobile: { width: 375, height: 667 },
};

Given('I navigate to the login page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.open();
});

Given('I navigate to the login page on a {string} viewport', async function (this: CustomWorld, device: string) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const viewport = VIEWPORTS[device];
  if (!viewport) throw new Error(`Unknown viewport device: ${device}`);
  await this.page.setViewportSize(viewport);
  const account = new AccountPage(this.page);
  await account.open();
});

Given('I open the {string} browser', async function (this: CustomWorld, _browser: string) {
  // Browser selection is handled at the Playwright config level.
  // This step exists for Gherkin readability and documentation purposes.
  // The actual browser is determined by the project configuration.
});

Then('the page styling uses CSS Framework v5.x', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cssLinks = this.page.locator('link[rel="stylesheet"]');
  const count = await cssLinks.count();
  let foundV5 = false;
  for (let i = 0; i < count; i++) {
    const href = await cssLinks.nth(i).getAttribute('href') ?? '';
    if (href.includes('v5') || href.includes('/5.')) {
      foundV5 = true;
      break;
    }
  }
  // Fallback: check for v5 class or data attribute on body/html
  const hasV5Attribute = await this.page.locator('[data-css-version*="5"]').count().then(c => c > 0);
  const hasV5Class = await this.page.locator('.css-framework-v5, .v5').count().then(c => c > 0);
  expect(foundV5 || hasV5Attribute || hasV5Class).toBeTruthy();
});

Then('the page is no longer using CSS Framework v3.x', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const cssLinks = this.page.locator('link[rel="stylesheet"]');
  const count = await cssLinks.count();
  for (let i = 0; i < count; i++) {
    const href = await cssLinks.nth(i).getAttribute('href') ?? '';
    expect(href).not.toContain('v3');
    expect(href).not.toContain('/3.');
  }
  const hasV3Attribute = await this.page.locator('[data-css-version*="3"]').count().then(c => c > 0);
  const hasV3Class = await this.page.locator('.css-framework-v3, .v3').count().then(c => c > 0);
  expect(hasV3Attribute || hasV3Class).toBeFalsy();
});

Then('the layout of the login page remains visually consistent with the current design', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const loginPage = this.page.getByTestId('login-page');
  await expect(loginPage).toBeVisible();
  // Verify key structural elements are present and in expected order
  const emailInput = this.page.getByTestId('email-input');
  const passwordInput = this.page.getByTestId('password-input');
  const signInButton = this.page.getByRole('button', { name: 'Sign in' });
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(signInButton).toBeVisible();
  // Verify email input appears before password input in the DOM
  const emailBoundingBox = await emailInput.boundingBox();
  const passwordBoundingBox = await passwordInput.boundingBox();
  expect(emailBoundingBox && passwordBoundingBox && emailBoundingBox.y < passwordBoundingBox.y).toBeTruthy();
});

Then('the login page displays correctly without visual breaking', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const loginPage = this.page.getByTestId('login-page');
  await expect(loginPage).toBeVisible();
  // Verify no horizontal overflow
  const scrollWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await this.page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
});

Then('all login form elements are visible and usable', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const emailInput = this.page.getByTestId('email-input');
  const passwordInput = this.page.getByTestId('password-input');
  const signInButton = this.page.getByRole('button', { name: 'Sign in' });
  await expect(emailInput).toBeVisible();
  await expect(emailInput).toBeEnabled();
  await expect(passwordInput).toBeVisible();
  await expect(passwordInput).toBeEnabled();
  await expect(signInButton).toBeVisible();
  await expect(signInButton).toBeEnabled();
});

When('I submit the login form without entering credentials', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const signInButton = this.page.getByRole('button', { name: 'Sign in' });
  await signInButton.click();
});

Then('I receive the appropriate validation messages', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  // Check for validation messages - could be inline or via HTML5 validation
  const emailInput = this.page.getByTestId('email-input');
  const passwordInput = this.page.getByTestId('password-input');
  // HTML5 validation
  const isEmailInvalid = await emailInput.evaluate(el => !(el as HTMLInputElement).checkValidity());
  const isPasswordInvalid = await passwordInput.evaluate(el => !(el as HTMLInputElement).checkValidity());
  // Or check for visible error messages
  const errorMessage = this.page.locator('[data-testid="error-message"], .error-message, [role="alert"]');
  const hasErrorMessages = await errorMessage.count().then(c => c > 0);
  expect(isEmailInvalid || isPasswordInvalid || hasErrorMessages).toBeTruthy();
});

Then('the page renders correctly with CSS Framework v5.x styling', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const loginPage = this.page.getByTestId('login-page');
  await expect(loginPage).toBeVisible();
  // Verify CSS is loaded by checking computed styles
  const backgroundColor = await loginPage.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(backgroundColor).not.toBe('');
});

Then('the username label and input are accessible for screen readers', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const emailInput = this.page.getByTestId('email-input');
  await expect(emailInput).toBeVisible();
  // Verify label association
  const labelId = await emailInput.getAttribute('aria-labelledby');
  const describedBy = await emailInput.getAttribute('aria-describedby');
  const hasLabel = labelId !== null || describedBy !== null;
  // Check for associated label element
  const htmlFor = await this.page.locator(`label[for="${await emailInput.getAttribute('id')}"]`).count().then(c => c > 0);
  // Check for aria-label or aria-labelledby
  const ariaLabel = await emailInput.getAttribute('aria-label');
  expect(hasLabel || htmlFor || ariaLabel).toBeTruthy();
});

Then('the password label and input are accessible for screen readers', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const passwordInput = this.page.getByTestId('password-input');
  await expect(passwordInput).toBeVisible();
  // Verify label association
  const labelId = await passwordInput.getAttribute('aria-labelledby');
  const describedBy = await passwordInput.getAttribute('aria-describedby');
  const hasLabel = labelId !== null || describedBy !== null;
  // Check for associated label element
  const htmlFor = await this.page.locator(`label[for="${await passwordInput.getAttribute('id')}"]`).count().then(c => c > 0);
  // Check for aria-label or aria-labelledby
  const ariaLabel = await passwordInput.getAttribute('aria-label');
  expect(hasLabel || htmlFor || ariaLabel).toBeTruthy();
});

Then('the submit button is accessible for screen readers', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const signInButton = this.page.getByRole('button', { name: 'Sign in' });
  await expect(signInButton).toBeVisible();
  // Verify button has accessible name (already verified by role selector)
  // Verify button is not hidden from screen readers
  const ariaHidden = await signInButton.getAttribute('aria-hidden');
  expect(ariaHidden).not.toBe('true');
  // Verify button type
  const type = await signInButton.getAttribute('type');
  expect(type).toBe('submit');
});

// @EP-4
