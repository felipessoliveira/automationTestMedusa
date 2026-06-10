@EP-9 @ui @checkout @address
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I have items in my cart
    And I am on the checkout page
    When I enter and save my shipping address, billing address, and email
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected to the delivery step or any other page