@ui @checkout @address @EP-9
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |
    When I open the checkout address page
    And I save the checkout address with:
      | shipping_first_name        | Felipe |
      | shipping_last_name         | Oliveira |
      | shipping_address_1         | 123 Main Street |
      | shipping_city              | Boston |
      | shipping_country_code      | us |
      | shipping_province          | MA |
      | shipping_postal_code       | 02118 |
      | billing_address_same_as_shipping | true |
      | email                      | qa.ep9.<timestamp>@example.com |
    Then the checkout address is saved successfully
    And I remain on the checkout page without redirecting to delivery or another page
