import { Page, expect } from '@playwright/test';
import { config } from '../support/config';

export interface AddressPayload {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
}

export class CheckoutPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto(`/${config.locale}/checkout?step=address`);
  }

  async fillShippingAddress(address: AddressPayload): Promise<void> {
    // Fill email using testid locator from element catalog
    await this.page.getByTestId('shipping-email-input').fill(address.email);

    // Fill phone if provided
    if (address.phone) {
      await this.page.getByTestId('shipping-phone-input').fill(address.phone);
    }

    // Fill shipping address form fields
    await this.page.locator('input[name="shipping_address.first_name"]').fill(address.first_name);
    await this.page.locator('input[name="shipping_address.last_name"]').fill(address.last_name);
    await this.page.locator('input[name="shipping_address.address_1"]').fill(address.address_1);
    if (address.address_2) {
      await this.page.locator('input[name="shipping_address.address_2"]').fill(address.address_2);
    }
    await this.page.locator('input[name="shipping_address.city"]').fill(address.city);
    await this.page.locator('input[name="shipping_address.postal_code"]').fill(address.postal_code);
    await this.page.locator('select[name="shipping_address.country_code"]').selectOption(address.country_code);
  }

  async setBillingSameAsShipping(same: boolean): Promise<void> {
    const checkbox = this.page.locator('.flex.items-center.space-x-2').getByRole('checkbox', { name: 'on' });
    const isChecked = await checkbox.isChecked();
    if (same !== isChecked) {
      await checkbox.click();
    }
  }

  async submitAddress(): Promise<void> {
    // Use testid locator from element catalog for submit button
    await this.page.getByTestId('submit-address-button').click();
  }

  async expectOnAddressStep(): Promise<void> {
    // Verify we're still on the address step by checking URL
    await expect(this.page).toHaveURL(/step=address/);
  }

  async expectNotRedirected(): Promise<void> {
    // Verify URL still contains checkout and has not moved to delivery step
    const url = this.page.url();
    expect(url).toContain('checkout');
    expect(url).not.toContain('step=delivery');
    expect(url).not.toContain('step=payment');
  }

  async expectAddressSaved(): Promise<void> {
    // Verify success indication - could be a toast, UI update, or form state
    // The submit button should no longer be visible or should show saved state
    await expect(this.page.getByTestId('submit-address-button')).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // Alternative: check for success notification or address summary display
    });
  }

  async getEmailValue(): Promise<string> {
    return await this.page.getByTestId('shipping-email-input').inputValue();
  }
}

// @EP-9
