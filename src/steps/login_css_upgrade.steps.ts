import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { rowsToObject } from './common.steps';

interface LoginPayload {
  email: string;
  password: string;
}

const deviceViewports: Record<string, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

Given('the login page is available after the CSS Framework upgrade', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.open();
  await account.expectLoginPageReady();
});

Given('the login page is using CSS Framework v5.x instead of v3.x', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.expectCssFrameworkV5Only();
});

When('I open the login page for {string} on {string}', async function (this: CustomWorld, browser: string, deviceType: string) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

  const viewport = deviceViewports[deviceType.toLowerCase()];
  if (!viewport) throw new Error(`Unsupported device type: ${deviceType}`);

  await this.page.setViewportSize(viewport);
  const account = new AccountPage(this.page);
  await account.open();
  await account.expectLoginPageReady();

  this.data.loginTarget = { browser, deviceType, viewport };
  this.attach(JSON.stringify({ browser, deviceType, viewport }, null, 2), 'application/json');
});

Then('the login page uses CSS Framework v5.x instead of v3.x', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectCssFrameworkV5Only();
});

Then('the login form layout is visually consistent and accessible', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoginFormLayoutAndAccessibility();
});

When(
  'I enter login credentials using the {string} user template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<LoginPayload>('users', overrides, template);
    this.data.user = payload;
    const account = new AccountPage(this.page);
    await account.fillLoginCredentials(payload.email, payload.password);
  },
);

When('I submit the login form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.submitLogin();
});

When(
  'I submit the login form with invalid credentials to trigger the existing login validation',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const account = new AccountPage(this.page);
    await account.submitInvalidLoginForValidation();
  },
);

Then('the existing login validation message is displayed to the user', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectValidationMessageVisible();
});

Then('the validation message is visually correct and accessible', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectValidationMessageVisualAndAccessible();
});

Then('the login page layout remains intact after the validation message appears', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoginFormLayoutAndAccessibility();
});
