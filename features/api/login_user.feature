@api @auth @EP-3
Feature: Login user via Medusa Store API

  Scenario Outline: Existing customer signs in through the Store API
    Given customer login credentials based on the "login" user template with:
      | email | <email> |
    When I POST them to the Medusa customer auth endpoint
    Then the response status is 200
    And the response body contains an auth token

    Examples:
      | email                      |
      | qa.shared.user@example.com |
