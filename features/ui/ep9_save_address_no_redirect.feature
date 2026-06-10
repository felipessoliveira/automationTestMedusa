@EP-9 @ui @checkout @address @requires-stock
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | variant  | Default |
      | quantity | 1       |
    And the customer navigates to the checkout address step
    When the customer enters their email and phone with the "default" user template
    And the customer submits the address form
    Then the address and email details are saved successfully
    And the customer remains on the checkout address step without being redirected
