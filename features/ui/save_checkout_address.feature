@ui @checkout @address @EP-9
Feature: Fix checkout page address and promo code discount preview

  Scenario: Save shipping address, billing address, and email on the checkout page without redirection
    Given a customer has items in their cart
    And the customer is on the checkout page
    When the customer enters and saves their shipping address, billing address, and email
    Then the address and email details are saved successfully
    And the customer remains on the checkout page without being redirected to the delivery step or any other page
