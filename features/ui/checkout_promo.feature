@ui @cart @checkout @EP-9
Feature: EP-9 Checkout Page Address and Promo Code Discount Preview

  Background:
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |

  Scenario: Successfully save shipping address without redirecting to delivery or checkout
    Given a customer has items in the cart and is on the checkout page
    When the customer enters and saves a valid shipping address
    Then the shipping address is successfully saved
    And the customer remains on the page without being redirected to delivery or checkout

  Scenario: Successfully save billing address and email without redirecting
    Given a customer has items in the cart and is on the checkout page
    And the customer has saved their shipping address
    When the customer enters and saves a valid billing address and email
    Then the billing address and email are successfully saved
    And the customer remains on the page without being redirected

  Scenario: Apply a valid promo code successfully after saving addresses
    Given a customer has items in the cart and is on the checkout page
    And the customer has saved their shipping address, billing address, and email
    When the customer enters and applies a valid address-dependent promo code
    Then the promo code is successfully applied

  Scenario: Immediate refresh and display of correct discount in cart totals
    Given a customer has items in the cart and is on the checkout page
    And the customer has saved their shipping address, billing address, and email
    When the customer applies a valid promo code
    Then the cart totals refresh immediately on the page
    And the cart summary displays the correct discount before proceeding to checkout

  Scenario: Verify applied promo code persists when navigating from cart to checkout
    Given a customer has items in the cart and is on the cart page
    And the customer has saved their shipping address, billing address, and email
    And the customer has successfully applied a valid promo code
    When the customer navigates from the cart page to the checkout page
    Then the applied promo code persists on the checkout page
    And the discount remains reflected in the order summary
