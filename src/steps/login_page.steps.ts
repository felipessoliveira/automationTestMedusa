import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { rowsToObject } from './common.steps';

interface LoginPayload {
  email: string;
  password: string;
}

Given('the login page is available after the CSS Framework upgrade', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.open();
  await account.expectLoginFormReady();
});

When(
  'I open the login page for the supported browser and device type:',
  async function (this: CustomWorld, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const supportedCombinations = table.hashes();
    expect(supportedCombinations).toContainEqual({ Browser: 'Chrome', 'Device Type': 'Desktop' });

    const account = new AccountPage(this.page);
    await account.open();
    await account.expectLoginFormReady();
  },
);

Then('the login page layout remains visually consistent with the current design', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoginLayoutConsistent();
});

Then(
  'the username field, password field, and submit button are displayed correctly without overlap or broken alignment',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const account = new AccountPage(this.page);
    await account.expectLoginControlsDisplayedWithoutOverlap();
  },
);

When(
  'I enter a username and password using the {string} user template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<LoginPayload>('users', overrides, template);
    this.data.user = payload;

    const account = new AccountPage(this.page);
    await account.enterLoginCredentials(payload.email, payload.password);
  },
);

When('I submit the login form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.submitLoginForm();
  this.data.loginFormSubmitted = true;
});

Then(
  'the CSS upgrade does not prevent users from entering credentials or submitting the form',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    expect(this.data.loginFormSubmitted).toBeTruthy();

    const account = new AccountPage(this.page);
    await account.expectLoggedIn();
  },
);

When('I submit the login form in a way that triggers the existing login validation', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.submitLoginFormWithoutCredentials();
});

Then('the existing validation message is displayed to the user', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectExistingLoginValidationMessage();
});
