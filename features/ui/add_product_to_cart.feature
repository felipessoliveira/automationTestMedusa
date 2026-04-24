@ui @cart @requires-stock
Feature: Add product to cart

  Scenario Outline: Add a product to the cart
    Given I am on the storefront
    When I add a product to the cart using the "default" product template with:
      | name | <name> |
    Then the cart page shows that product with the template quantity

    Examples:
      | name              |
      | Medusa T-Shirt    |
      | Medusa Sweatshirt |
