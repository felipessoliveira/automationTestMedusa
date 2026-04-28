export interface RegisterCustomerPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginCustomerPayload {
  email: string;
  password: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  has_account?: boolean;
  created_at?: string;
}

export interface CreateCustomerResponse {
  customer: Customer;
}
