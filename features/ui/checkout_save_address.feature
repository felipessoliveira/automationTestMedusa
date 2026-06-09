@ui @checkout @address @EP-9 @requires-stock
Feature: Save checkout address without redirection

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |
    And I proceed to the checkout address step
    When I fill and save the shipping address, billing address, and email using the "default" address template
    Then the address and email details are saved successfully
    And I remain on the checkout address step without being redirected