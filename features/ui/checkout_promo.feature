@ui @checkout @promo @EP-9
Feature: Fix checkout page address and promo code discount preview

  Background:
    Given I am on the storefront
    And I add a product to the cart using the "default" product template with:
      | name | Medusa T-Shirt |

  @P0 @checkout @address
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    And I navigate to the checkout page
    When I enter and save my shipping address, billing address, and email on the checkout page
    Then the address and email details are saved successfully
    And I remain on the checkout page without being redirected

  @P0 @checkout @promo
  Scenario: Apply a valid promo code after address is saved to refresh totals immediately
    And I navigate to the checkout page
    And I enter and save my shipping address, billing address, and email on the checkout page
    When I apply a valid promo code "SAVE20"
    Then the promo code "SAVE20" is applied successfully
    And the cart summary totals refresh immediately to display the correct discount

  @checkout @promo @error
  Scenario Outline: Show a clear inline error for invalid, empty, duplicate, or ineligible promo codes
    And I navigate to the checkout page
    And I enter and save my shipping address, billing address, and email on the checkout page
    When I apply an invalid promo code "<code>"
    Then I see an inline error message "<message>"

    Examples:
      | code    | message                              |
      | INVALID | Promo code is invalid                |
      |         | Please enter a promo code            |
      | EXPIRED | Promo code has expired or is invalid |

  @checkout @promo @persistence
  Scenario: Applied promo codes persist when navigating from cart to checkout
    And I am on the cart page
    And I apply a valid promo code "SAVE20" on the cart page
    When I navigate to the checkout page
    Then the promo code "SAVE20" is still applied on the checkout page
    And the cart summary totals on the checkout page display the discount

  @checkout @regression
  Scenario: Regression check for existing checkout address and promo-code flows
    And I navigate to the checkout page
    When I enter and save my shipping address, billing address, and email on the checkout page
    Then the address and email details are saved successfully