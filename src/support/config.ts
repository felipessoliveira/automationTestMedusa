import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}. Copy .env.example to .env and fill it in.`);
  }
  return v;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export interface Config {
  baseUrl: string;
  locale: string;
  api: {
    url: string;
    publishableKey: string;
  };
  testUser: {
    email: string;
    password: string;
  };
  runtime: {
    headed: boolean;
  };
}

export const config: Config = {
  baseUrl: required('BASE_URL', 'https://medusa-storefront-839705751382.europe-west1.run.app'),
  locale: required('LOCALE', 'es'),
  api: {
    url: optional('MEDUSA_API_URL'),
    publishableKey: optional('MEDUSA_PUBLISHABLE_KEY'),
  },
  testUser: {
    email: required('TEST_USER_EMAIL', 'qa.shared.user@example.com'),
    password: required('TEST_USER_PASSWORD', 'ChangeMe!123'),
  },
  runtime: {
    headed: process.env.HEADED === '1',
  },
};

export function assertApiConfigured(): void {
  if (!config.api.url) {
    throw new Error('MEDUSA_API_URL is not set — required for @api scenarios.');
  }
  if (!config.api.publishableKey) {
    throw new Error('MEDUSA_PUBLISHABLE_KEY is not set — required for @api scenarios.');
  }
}
