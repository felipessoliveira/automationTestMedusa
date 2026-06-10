@EP-9 @checkout @address @ui
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I have a product in my cart
    And I am on the checkout page
    When I enter shipping address details using the "default" address template with:
      | first_name | <first_name> |
      | last_name  | <last_name>  |
      | address_1  | <address_1>  |
      | city       | <city>       |
      | postal_code| <postal_code>|
    And I enter billing address details using the "default" address template with:
      | first_name | <first_name> |
      | last_name  | <last_name>  |
      | address_1  | <address_1>  |
      | city       | <city>       |
      | postal_code| <postal_code>|
    And I enter email
    And I submit the address form
    Then the address and email details are saved successfully
    And I remain on the checkout page