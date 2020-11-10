Feature: Accounts

  Scenario: Get an account
    Given I want to get information about an account
    When I try to access it with "gacha" as the context
    Then I should receive account details such as its ID, balance, reserved balance, and virtual balance

  Scenario: Get an account
    Given I want to get all accounts with their information
    Then I should receive all accounts with their details with pagination

  Scenario: Update account
    Given I want to add 500.00 to the balance of an account
    Then the balance should increased by 500.00
