@ui @checkout @address @EP-9
Feature: Save checkout page address and email without redirection

  As a customer, I want to save my shipping details on the checkout page,
  so that I can stay on the checkout page before proceeding to payment

  @P0
  Scenario Outline: Save shipping address, billing address, and email without redirection
    Given I have a product in the cart using the "default" product template
    And I am on the checkout address page
    When I save the checkout address using the "default" address template with:
      | first_name | <first_name> |
      | last_name  | <last_name>  |
      | email      | <email>      |
    Then the checkout address and email details are saved successfully
    And I remain on the checkout address page without being redirected to delivery

    Examples:
      | first_name | last_name | email                              |
      | Felipe     | Oliveira  | qa.checkout.<timestamp>@example.com |
