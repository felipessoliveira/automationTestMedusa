import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { AccountPage } from '../pages/AccountPage';

interface LoginPayload {
  email: string;
  password: string;
}

Given('the login page is available after the CSS Framework upgrade', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.open();
  await account.expectLoginPageVisualConsistency();
});

When('I open the login page in each supported browser and device type:', async function (this: CustomWorld, table: DataTable) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  const browserName = this.page.context().browser()?.browserType().name() ?? '';

  for (const row of table.hashes()) {
    const expectedBrowser = (row.Browser ?? '').toLowerCase();
    const deviceType = row['Device Type'] ?? 'Desktop';

    if (expectedBrowser) {
      const browserMatches = expectedBrowser === 'chrome'
        ? /chrom(e|ium)/.test(browserName)
        : browserName.includes(expectedBrowser);
      expect(browserMatches, `Current browser ${browserName} should satisfy ${row.Browser}`).toBeTruthy();
    }

    await account.openForDeviceType(deviceType);
  }
});

Then('the login page layout remains visually consistent with the current design', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoginPageVisualConsistency();
});

Then(
  'the username field, password field, and submit button are displayed correctly without overlap or broken alignment',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const account = new AccountPage(this.page);
    await account.expectLoginControlsDisplayedWithoutOverlap();
  },
);

Then('the page displays correctly on desktop, tablet, and mobile device types', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectResponsiveLoginPage();
});

Then('labels, inputs, and buttons remain accessible for screen readers', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoginFormAccessibleToScreenReaders();
});

When('I enter a username and password', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const payload = buildFixture<LoginPayload>('users', {}, 'login');
  this.data.user = payload;
  const account = new AccountPage(this.page);
  await account.fillLoginCredentials(payload.email, payload.password);
});

When('I submit the login form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.submitLoginForm();
});

Then('the login form submission works using the existing login functionality', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoggedIn();
});

Then('the CSS upgrade does not prevent users from entering credentials or submitting the form', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoggedIn();
});

When('I submit the login form in a way that triggers the existing login validation', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.fillLoginCredentials(`qa.invalid.${Date.now()}@example.com`, 'InvalidPassword123!');
  await account.submitLoginForm();
});

Then('the existing validation message is displayed to the user', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectValidationMessageVisible();
});
