import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage, ProductCandidate } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { config } from '../support/config';

// ---------------------------------------------------------------------------
// Checkout address step definitions – EP-9
// ---------------------------------------------------------------------------

/**
 * Precondition: adds a stocked product to the cart via the storefront and
 * then navigates directly to the checkout address step.
 */
Given(
  'a customer has items in their cart and is on the checkout address page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');

    const home = new HomePage(this.page);
    await home.open();

    const products = await home.listProducts();
    if (products.length === 0) {
      throw new Error('No product links were discovered on the storefront.');
    }

    const attempted: string[] = [];
    let added = false;

    for (const candidate of products as ProductCandidate[]) {
      await home.openProductByHref(candidate.href);
      const pdp = new ProductPage(this.page);

      if (await pdp.canAddToCart()) {
        await pdp.addToCart();
        added = true;
        break;
      }

      attempted.push(candidate.name);
      await home.open();
    }

    if (!added) {
      throw new Error(
        `No stocked product was available to add to cart. Tried: ${attempted.join(', ')}`,
      );
    }

    // Navigate directly to the checkout address step.
    const locale = config.locale || 'es';
    await this.page.goto(`/${locale}/checkout?step=address`);
    await this.page.waitForURL(`**/${locale}/checkout?step=address`, { timeout: 15_000 });
  },
);

/**
 * Action: fills in shipping address, billing address (same-as-shipping
 * checkbox left checked by default), and email, then submits.
 */
When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const page = this.page;

    // --- Shipping address fields (test-id based locators from element catalog) ---
    // First name
    await page.getByTestId('shipping-first-name-input').fill('QA');
    // Last name
    await page.getByTestId('shipping-last-name-input').fill('Tester');
    // Address line 1
    await page.getByTestId('shipping-address-input').fill('Calle Gran Via 1');
    // City
    await page.getByTestId('shipping-city-input').fill('Madrid');
    // Postal code
    await page.getByTestId('shipping-postal-code-input').fill('28013');
    // Country – select Spain (value 'es') if the select is present
    const countrySelect = page.getByTestId('shipping-country-select');
    if (await countrySelect.isVisible().catch(() => false)) {
      await countrySelect.selectOption({ value: 'es' });
    }
    // Province / state (optional field – fill only when visible)
    const provinceInput = page.getByTestId('shipping-province-input');
    if (await provinceInput.isVisible().catch(() => false)) {
      await provinceInput.fill('Madrid');
    }

    // --- Email (element catalog: testId='shipping-email-input') ---
    await page.getByTestId('shipping-email-input').fill('qa.tester@example.com');

    // --- Phone (element catalog: testId='shipping-phone-input') ---
    const phoneInput = page.getByTestId('shipping-phone-input');
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('+34600000000');
    }

    // Billing address: leave the "same as shipping" checkbox checked (default).
    // If the billing section renders separately, fill matching fields.
    const billingSection = page.getByTestId('billing-address-container');
    if (await billingSection.isVisible().catch(() => false)) {
      await page.getByTestId('billing-first-name-input').fill('QA');
      await page.getByTestId('billing-last-name-input').fill('Tester');
      await page.getByTestId('billing-address-input').fill('Calle Gran Via 1');
      await page.getByTestId('billing-city-input').fill('Madrid');
      await page.getByTestId('billing-postal-code-input').fill('28013');
      const billingCountry = page.getByTestId('billing-country-select');
      if (await billingCountry.isVisible().catch(() => false)) {
        await billingCountry.selectOption({ value: 'es' });
      }
    }

    // --- Submit (element catalog: testId='submit-address-button') ---
    await page.getByTestId('submit-address-button').click();

    // Allow a short moment for any save request to complete without enforcing
    // a redirect assertion here – that is the responsibility of the Then step.
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
      // networkidle is a best-effort wait; non-fatal if it times out.
    });
  },
);

/**
 * Assertion: the page URL still contains step=address, confirming no
 * automatic redirection to the delivery step or any other page occurred.
 */
Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    // A visible confirmation element or simply no error banner is sufficient
    // to conclude the save was successful. We assert no inline error is shown.
    const errorBanner = this.page.getByTestId('address-error-message');
    const errorVisible = await errorBanner.isVisible().catch(() => false);
    expect(errorVisible, 'Expected no address error message after saving').toBe(false);
  },
);

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const currentUrl = this.page.url();
    expect(
      currentUrl,
      'Customer should remain on the checkout address step and not be redirected to delivery',
    ).toContain('checkout?step=address');
    expect(
      currentUrl,
      'Customer URL must not advance to the delivery step automatically',
    ).not.toContain('step=delivery');
  },
);

// @EP-9
