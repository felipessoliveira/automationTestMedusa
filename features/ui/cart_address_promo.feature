@ui @cart @EP-9
Feature: Cart page address and promo code discount preview

  Scenario: Save shipping address on the cart page without redirecting to checkout
    Given a customer has items in the cart
    And the customer is on the cart page
    When the customer enters the required shipping address information
    And saves the shipping address on the cart page
    Then the shipping address is saved successfully
    And the customer remains on the cart page
    And the customer is not redirected to checkout

  Scenario: Save billing address and email on the cart page without redirecting to checkout
    Given a customer has items in the cart
    And the customer is on the cart page
    When the customer enters the required billing address information
    And enters the email address
    And saves the billing address and email on the cart page
    Then the billing address and email are saved successfully
    And the customer remains on the cart page
    And the customer is not redirected to checkout
