@ui @auth @EP-4
Feature: Login via storefront UI

  Scenario Outline: Existing customer signs in
    Given I am on the account page
    When I sign in using the "login" user template with:
      | email | <email> |
    Then I see the authenticated account dashboard

    Examples:
      | email                      |
      | qa.shared.user@example.com |
