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

  async register(payload: RegisterCustomerPayload): Promise<{
    response: APIResponse;
    body: CreateCustomerResponse;
  }> {
    const response = await this.api.post('/store/customers', {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    const body = (await response.json()) as CreateCustomerResponse;
    return { response, body };
  }

  async authenticate(email: string, password: string): Promise<APIResponse> {
    return this.api.post('/store/auth/customer', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });
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
