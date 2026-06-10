@EP-9 @checkout @address @ui
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given I have items in my cart
    And I am on the checkout page
    When the customer enters and saves their shipping address, billing address, and email
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected to the delivery step or any other page