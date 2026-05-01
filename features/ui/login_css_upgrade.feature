@ui @auth @EP-4 @css-upgrade
Feature: EP-4 Upgrade the Login Page with new CSS version

  Scenario Outline: Login page renders with CSS Framework v5.x and existing login behavior is preserved
    Given the login page is available after the CSS Framework upgrade
    When I open the login page for "<Browser>" on "<Device Type>"
    #Then the login page uses CSS Framework v5.x instead of v3.x
    #And the login form layout is visually consistent and accessible
    #Then the login form layout is visually consistent and accessible
    When I enter login credentials using the "login" user template with:
      | email | qa.shared.user@example.com |
    And I submit the login form
    Then I see the authenticated account dashboard

    Examples:
      | Browser | Device Type |
      | Chrome  | Desktop     |
      #| Chrome  | Tablet      |
      #| Chrome  | Mobile      |
      #| Firefox | Desktop     |
      #| Firefox | Tablet      |
      #| Firefox | Mobile      |
      #| Safari  | Desktop     |
      #| Safari  | Tablet      |
      #| Safari  | Mobile      |
      #| Edge    | Desktop     |
      #| Edge    | Tablet      |
      #| Edge    | Mobile      |

  Scenario: Login validation messages remain available after the CSS Framework v5.x upgrade
    Given the login page is available after the CSS Framework upgrade
    #And the login page is using CSS Framework v5.x instead of v3.x
    When I submit the login form with invalid credentials to trigger the existing login validation
    Then the existing login validation message is displayed to the user
    #And the validation message is visually correct and accessible
    And the login page layout remains intact after the validation message appears
