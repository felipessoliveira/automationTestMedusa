import { When, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { rowsToObject } from './common.steps';

interface LoginPayload {
  email: string;
  password: string;
}

When(
  'I sign in using the {string} user template with:',
  async function (this: CustomWorld, template: string, table: DataTable) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const overrides = rowsToObject(table);
    const payload = buildFixture<LoginPayload>('users', overrides, template);
    this.data.user = payload;
    const account = new AccountPage(this.page);
    await account.login(payload.email, payload.password);
  },
);
