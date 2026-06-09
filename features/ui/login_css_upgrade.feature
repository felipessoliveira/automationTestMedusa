@ui @auth @EP-4 @css-upgrade
Feature: Upgrade the Login Page with new CSS version

  Scenario: Verify CSS Framework version is updated to v5.x
    Given I navigate to the login page
    Then the page styling uses CSS Framework v5.x
    And the page is no longer using CSS Framework v3.x

  Scenario: Verify UI layout is preserved after CSS upgrade
    Given I navigate to the login page
    Then the layout of the login page remains visually consistent with the current design

  Scenario Outline: Verify responsive design of the login page
    Given I navigate to the login page on a "<Device>" viewport
    Then the login page displays correctly without visual breaking
    And all login form elements are visible and usable

    Examples:
      | Device  |
      | Desktop |
      | Tablet  |
      | Mobile  |

  Scenario: Verify login functionality is unaffected by the CSS upgrade
    Given I am on the account page
    When I sign in using the "login" user template with:
      | email | [EMAIL] |
    Then I see the authenticated account dashboard

  Scenario: Verify validation messages are still received after the CSS upgrade
    Given I am on the account page
    When I submit the login form without entering credentials
    Then I receive the appropriate validation messages

  Scenario Outline: Verify cross-browser compatibility of the login page
    Given I open the "<Browser>" browser
    And I navigate to the login page
    Then the page renders correctly with CSS Framework v5.x styling
    And the layout is visually consistent with the current design

    Examples:
      | Browser |
      | Chrome  |
      | Firefox |
      | Safari  |
      | Edge    |

  Scenario: Verify accessibility of login page elements for screen readers
    Given I navigate to the login page
    Then the username label and input are accessible for screen readers
    And the password label and input are accessible for screen readers
    And the submit button is accessible for screen readers
