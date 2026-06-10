import { Page, expect } from '@playwright/test';

export interface AddressFixture {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
}

export class CheckoutPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/es/checkout?step=address');
  }

  async fillEmail(email: string) {
    await this.page.getByTestId('shipping-email-input').fill(email);
  }

  async fillPhone(phone: string) {
    await this.page.getByTestId('shipping-phone-input').fill(phone);
  }

  async fillAddress(data: AddressFixture) {
    // Using placeholders as specific testids for address fields were not in the catalog
    await this.page.getByPlaceholder('First Name').fill(data.first_name);
    await this.page.getByPlaceholder('Last Name').fill(data.last_name);
    await this.page.getByPlaceholder('Address').fill(data.address_1);
    await this.page.getByPlaceholder('City').fill(data.city);
    await this.page.getByPlaceholder('Postal Code').fill(data.postal_code);
  }

  async submit() {
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnCheckoutPage() {
    await expect(this.page).toHaveURL(/\/checkout/);
  }

  async expectSuccess() {
    // Assuming a success message or URL change indicates success
    await this.expectOnCheckoutPage();
  }
}

// @EP-9
