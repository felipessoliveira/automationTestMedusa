@EP-9 @checkout @promo @ui
Feature: Fix checkout page address and promo code discount preview

  As a customer, I want to save my shipping details and apply promo codes on the checkout page,
  so that I can see the recalculated cart totals immediately before proceeding to payment

  @P0 @checkout @address @requires-stock
  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given a customer has items in their cart
    And the customer is on the checkout page
    When the customer enters and saves their shipping address, billing address, and email
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected to the delivery step or any other page
