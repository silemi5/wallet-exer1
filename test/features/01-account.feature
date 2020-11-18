Feature: Accounts

  Scenario: Get an account
    Given I want to get information about an account
    When I try to access it with "gacha" as the context
    Then I should receive account details such as its ID, balance, reserved balance, and virtual balance

  Scenario: Get an account (idempotency)
    Given I want to get information about an account
    When I try to access it with "gacha" as the context with a X-REQUEST-ID header
    Then I should receive account details such as its ID, balance, reserved balance, and virtual balance

  Scenario: Get all accounts
    Given I want to get all accounts with their information
    Then I should receive all accounts with their details with pagination

  Scenario: Get all accounts (idempotency)
    Given I want to get all accounts with their information with a X-REQUEST-ID header
    Then I should receive all accounts with their details with pagination

  Scenario: Update account balance (add)
    Given I want to add 500.00 to the balance of an account
    Then the balance should increase by 500.00

  Scenario: Update account balance (subtract)
    Given I want to subtract 300.00 to the balance of an account
    Then the balance should decrease by 300.00
