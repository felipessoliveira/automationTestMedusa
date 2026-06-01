@ui @checkout @promo @EP-9
Feature: Fix checkout page address and promo code discount preview

  Background:
    Given I am on the storefront
    When I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |

  @P0 @checkout @address
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given a customer has items in their cart
    And the customer is on the checkout page
    When the customer enters and saves their shipping address, billing address, and email
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected to the delivery step or any other page

  @P0 @checkout @promo
  Scenario: Apply a valid promo code after address is saved to refresh totals immediately
    Given a customer has items in their cart
    And the customer is on the checkout page
    And the customer has saved their shipping address, billing address, and email on the checkout page
    When the customer enters and applies a valid promo code "SAVE20"
    Then the promo code "SAVE20" is applied successfully
    And the cart summary totals on the checkout page refresh immediately to display the correct discount before proceeding
