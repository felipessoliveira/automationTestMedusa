@ui @user
Feature: Create user via storefront UI

  Scenario Outline: Register a new customer through the sign-up form
    Given I am on the account page
    When I submit the registration form using the "default" user template with:
      | email      | <email>      |
      | first_name | <first_name> |
    Then I see the authenticated account dashboard

    Examples:
      | email                         | first_name |
      | qa.ui.<timestamp>@example.com | Felipe     |
