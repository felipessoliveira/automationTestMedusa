import type { APIRequestContext, APIResponse } from '@playwright/test';
import { assertApiConfigured, config } from '../../support/config';
import type {
  CreateCustomerResponse,
  Customer,
  RegisterCustomerPayload,
} from '../models/customer';

// Thin wrapper over Playwright's APIRequestContext targeting the Medusa
// Store API. The context itself is created in hooks.ts (baseURL +
// x-publishable-api-key header), so this class just knows the routes.
export class CustomerClient {
  constructor(private readonly api: APIRequestContext) {
    assertApiConfigured();
  }

  // Medusa v2 register flow is two-step:
  //   1) POST /auth/customer/emailpass/register → returns a JWT
  //   2) POST /store/customers (Bearer JWT)     → creates the customer record
  async register(payload: RegisterCustomerPayload): Promise<{
    response: APIResponse;
    body: CreateCustomerResponse;
  }> {
    const authRes = await this.api.post('/auth/customer/emailpass/register', {
      data: { email: payload.email, password: payload.password },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!authRes.ok()) {
      return { response: authRes, body: { customer: { id: '', email: payload.email } } };
    }
    const { token } = (await authRes.json()) as { token: string };

    const response = await this.api.post('/store/customers', {
      data: {
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const body = (await response.json()) as CreateCustomerResponse;
    return { response, body };
  }

  async authenticate(email: string, password: string): Promise<{
    response: APIResponse;
    token?: string;
  }> {
    const response = await this.api.post('/auth/customer/emailpass', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok()) return { response };
    const { token } = (await response.json()) as { token: string };
    return { response, token };
  }

  async me(): Promise<Customer | null> {
    const res = await this.api.get('/store/customers/me');
    if (!res.ok()) return null;
    const body = (await res.json()) as CreateCustomerResponse;
    return body.customer ?? null;
  }

  // Utility for tests: expose the configured backend base so assertions can
  // reference it without importing config.
  static get baseUrl(): string {
    return config.api.url;
  }
}
