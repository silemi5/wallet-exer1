Feature: Get an account

  Scenario: Get an account
    Given I want to get information about an account
    When I try to access it with "gacha" as the context
    Then I should receive account details such as its ID, balance, reserved balance, and virtual balance
