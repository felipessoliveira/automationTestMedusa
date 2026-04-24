import { When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { AccountPage, RegisterPayload } from '../pages/AccountPage';
import { rowsToObject } from './common.steps';

When(
  'I submit the registration form using the {string} user template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<RegisterPayload>('users', overrides, template);
    this.data.user = payload;
    const account = new AccountPage(this.page);
    await account.register(payload);
  },
);

Then('I see the authenticated account dashboard', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized');
  const account = new AccountPage(this.page);
  await account.expectLoggedIn();
});
