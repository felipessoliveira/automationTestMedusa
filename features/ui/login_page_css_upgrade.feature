@ui @auth @EP-4
Feature: EP-4 Upgrade the Login Page with new CSS version

  Scenario: Login page renders with CSS Framework v5.x and existing login behavior is preserved
    Given the login page is available after the CSS Framework upgrade
    When I open the login page for the supported browser and device type:
      | Browser | Device Type |
      | Chrome  | Desktop     |
    Then the login page layout remains visually consistent with the current design
    And the username field, password field, and submit button are displayed correctly without overlap or broken alignment
    When I enter a username and password using the "login" user template with:
      | email | qa.shared.user@example.com |
    And I submit the login form
    Then I see the authenticated account dashboard
    And the CSS upgrade does not prevent users from entering credentials or submitting the form

  Scenario: Login validation messages remain available after the CSS Framework v5.x upgrade
    Given the login page is available after the CSS Framework upgrade
    When I submit the login form in a way that triggers the existing login validation
    Then the existing validation message is displayed to the user
