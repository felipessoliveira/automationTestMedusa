@ui @checkout @address @EP-9 @requires-stock
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details on the checkout page,
  so that I can proceed without being redirected to the delivery step.

  @P0
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    When I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |
    And I am on the checkout address step
    And I save the shipping address, billing address, and email using the "default" address template with:
      | email | qa.checkout.<timestamp>@example.com |
    Then the address and email details are saved successfully
    And I remain on the checkout page without being redirected to the delivery step
