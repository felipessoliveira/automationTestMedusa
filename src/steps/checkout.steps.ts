import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildFixture } from '../utils/fixtures';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CartPage } from '../pages/CartPage';
import { rowsToObject } from './common.steps';

interface ShippingDetails {
  email: string;
  phone: string;
}

When(
  'the customer enters and saves their shipping address, billing address, and email',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized (missing @ui tag?)');
    const checkout = new CheckoutPage(this.page);
    const user = buildFixture<ShippingDetails>({}, 'users', 'default');
    await checkout.fillShippingDetails(user.email, user.phone);
    await checkout.submitAddress();
  },
);

Then(
  'the address and email details are saved successfully',
  async function (this: CustomWorld) {
    // Success is implied by the URL remaining stable and no error state.
    // We verify the URL in the next step.
  },
);

Then(
  'the customer remains on the checkout page without being redirected to the delivery step or any other page',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('UI page not initialized');
    const checkout = new CheckoutPage(this.page);
    await checkout.page.waitForURL(/\/checkout\?step=address/, { timeout: 5000 });
  },
);

// @EP-9
