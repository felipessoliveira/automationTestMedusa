@ui @EP-9 @checkout @address @requires-stock
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details and apply promo codes on the checkout page,
  so that I can see the recalculated cart totals immediately before proceeding to payment

  @P0 @checkout @address
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I add a product to the cart using the "default" product template with:
      | variant  | default |
      | quantity | 1       |
    And the customer is on the checkout address step
    When the customer fills and submits the address form with:
      | email | qa.checkout.ep9@example.com |
      | phone | +34600000001                |
    Then the address and email details are saved successfully
    And the customer remains on the checkout address step
