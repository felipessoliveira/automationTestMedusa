import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutAddress {
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
  province?: string;
  email: string;
  phone?: string;
}

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly container = () => this.page.getByTestId('checkout-container');
  private readonly firstName = () => this.page.getByTestId('shipping-first-name-input');
  private readonly lastName = () => this.page.getByTestId('shipping-last-name-input');
  private readonly addressInput = () => this.page.getByTestId('shipping-address-input');
  private readonly postalCode = () => this.page.getByTestId('shipping-postal-code-input');
  private readonly city = () => this.page.getByTestId('shipping-city-input');
  private readonly province = () => this.page.getByTestId('shipping-province-input');
  private readonly email = () => this.page.getByTestId('shipping-email-input');
  private readonly phone = () => this.page.getByTestId('shipping-phone-input');
  private readonly billingSameCheckbox = () => this.page.getByTestId('billing-address-checkbox');
  private readonly submitAddress = () => this.page.getByTestId('submit-address-button');

  async openAddressStep(): Promise<void> {
    await this.goto('/checkout?step=address');
    await expect(this.container()).toBeVisible();
  }

  async fillAndSaveAddress(addr: CheckoutAddress): Promise<void> {
    await this.firstName().fill(addr.first_name);
    await this.lastName().fill(addr.last_name);
    await this.addressInput().fill(addr.address);
    await this.postalCode().fill(addr.postal_code);
    await this.city().fill(addr.city);
    if (addr.province) await this.province().fill(addr.province);
    await this.email().fill(addr.email);
    if (addr.phone) await this.phone().fill(addr.phone);

    // Keep billing address same as shipping (ensures billing is captured too).
    const billing = this.billingSameCheckbox();
    if ((await billing.count()) > 0) {
      const checked = await billing.getAttribute('aria-checked');
      if (checked === 'false') {
        await billing.click();
      }
    }

    await this.submitAddress().click();
  }

  async expectAddressSaved(addr: CheckoutAddress): Promise<void> {
    // Saved details are reflected back on the page (summary / persisted fields).
    await expect
      .poll(async () => (await this.page.content()).includes(addr.email), { timeout: 15_000 })
      .toBeTruthy();
  }

  async expectStillOnCheckout(): Promise<void> {
    await this.expectUrlContains('/checkout');
    await expect(this.container()).toBeVisible();
  }
}

// @EP-9
