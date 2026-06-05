@ui @checkout @address @EP-9 @P0
Feature: Save checkout address without redirection

  As a customer, I want to save my shipping details on the checkout page,
  so that I can review my information before proceeding to payment

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |
    And I am on the checkout address step
    When I save my shipping address, billing address, and email using the "default" address template with:
      | email | qa.checkout.<timestamp>@example.com |
    Then the address and email details are saved successfully
    And I remain on the checkout address step without being redirected
