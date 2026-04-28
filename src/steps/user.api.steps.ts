import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CustomerClient } from '../api/clients/customerClient';
import type { LoginCustomerPayload, RegisterCustomerPayload } from '../api/models/customer';
import { rowsToObject } from './common.steps';

Given(
  'a customer payload based on the {string} user template with:',
  function (this: CustomWorld, template: string, table: DataTable) {
    const overrides = rowsToObject(table);
    const payload = buildFixture<RegisterCustomerPayload>('users', overrides, template);
    this.data.user = payload;
  },
);

Given(
  'customer login credentials based on the {string} user template with:',
  function (this: CustomWorld, template: string, table: DataTable) {
    const overrides = rowsToObject(table);
    const payload = buildFixture<LoginCustomerPayload>('users', overrides, template);
    this.data.user = payload;
  },
);

When('I POST it to the Medusa store customers endpoint', async function (this: CustomWorld) {
  if (!this.api) throw new Error('API context not initialized (missing @api tag?)');
  const client = new CustomerClient(this.api);
  const payload = this.data.user as RegisterCustomerPayload;
  const { response, body } = await client.register(payload);
  this.data.apiResponse = { status: response.status(), body };
  this.attach(JSON.stringify({ payload, status: response.status(), body }, null, 2), 'application/json');
});

When('I POST them to the Medusa customer auth endpoint', async function (this: CustomWorld) {
  if (!this.api) throw new Error('API context not initialized (missing @api tag?)');
  const client = new CustomerClient(this.api);
  const payload = this.data.user as LoginCustomerPayload;
  const { response, token } = await client.authenticate(payload.email, payload.password);
  this.data.apiResponse = { status: response.status(), token };
  this.attach(
    JSON.stringify({ email: payload.email, status: response.status(), hasToken: Boolean(token) }, null, 2),
    'application/json',
  );
});

Then('the response status is {int}', function (this: CustomWorld, expected: number) {
  const res = this.data.apiResponse as { status: number };
  expect(res.status).toBe(expected);
});

Then('the response body contains the customer id and email', function (this: CustomWorld) {
  const res = this.data.apiResponse as { body: { customer?: { id: string; email: string } } };
  const user = this.data.user as RegisterCustomerPayload;
  expect(res.body.customer?.id).toBeTruthy();
  expect(res.body.customer?.email).toBe(user.email);
});

Then('the response body contains an auth token', function (this: CustomWorld) {
  const res = this.data.apiResponse as { token?: string };
  expect(res.token).toBeTruthy();
});
