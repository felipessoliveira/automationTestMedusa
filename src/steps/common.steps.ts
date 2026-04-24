import { Given, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/HomePage';
import { AccountPage } from '../pages/AccountPage';

Given('I am on the storefront', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const home = new HomePage(this.page);
  await home.open();
});

Given('I am on the account page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
  const account = new AccountPage(this.page);
  await account.open();
});

// Converts a 2-column DataTable (field | value) into a plain object.
// Exported here so every step file can reuse it.
export function rowsToObject(table: DataTable): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of table.raw()) {
    if (k !== undefined && v !== undefined) out[k] = v;
  }
  return out;
}
