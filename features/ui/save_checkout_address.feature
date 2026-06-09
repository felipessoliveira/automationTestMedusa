@EP-9 @checkout @address @ui @requires-stock
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details and apply promo codes on the checkout page, so that I can see the recalculated cart totals immediately before proceeding to payment

  @P0 @checkout @address
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |
    And I am on the checkout page
    When I enter and save the shipping address, billing address, and email using the "default" address template
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected
