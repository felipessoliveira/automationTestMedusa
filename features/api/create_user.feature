@api @user
Feature: Create user via Medusa Store API

  Scenario Outline: Register a new customer through the Store API
    Given a customer payload based on the "default" user template with:
      | email | <email> |
    When I POST it to the Medusa store customers endpoint
    Then the response status is 200
    And the response body contains the customer id and email

    Examples:
      | email                          |
      | qa.api.<timestamp>@example.com |
