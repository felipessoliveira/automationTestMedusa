@ui @checkout @address @EP-9 @requires-stock
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details on the checkout page,
  so that I can continue shopping without being redirected to the delivery step

  @P0
  Scenario Outline: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | <name> |
    And I am on the checkout address step
    When I save the checkout address details using the "default" address template with:
      | email | <email> |
    Then the checkout address and email details are saved successfully
    And I remain on the checkout page without being redirected to the delivery step

    Examples:
      | name           | email                              |
      | Medusa T-Shirt | qa.checkout.<timestamp>@example.com |
