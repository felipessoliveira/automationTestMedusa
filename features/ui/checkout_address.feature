@ui @checkout @address @EP-9 @requires-stock
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details on the checkout page,
  so that I can continue without being redirected to the delivery step

  Scenario Outline: Save shipping address, billing address, and email without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | <name> |
    And I am on the checkout address step
    When I save the checkout address with:
      | first_name   | <first_name>   |
      | last_name    | <last_name>    |
      | address      | <address>      |
      | postal_code  | <postal_code>  |
      | city         | <city>         |
      | country_code | <country_code> |
      | email        | <email>        |
    Then the checkout address and email details are saved
    And I remain on the checkout address step

    Examples:
      | name           | first_name | last_name | address      | postal_code | city   | country_code | email                         |
      | Medusa T-Shirt | Felipe     | Oliveira  | Calle Mayor 1 | 28013       | Madrid | es           | qa.ui.<timestamp>@example.com |
