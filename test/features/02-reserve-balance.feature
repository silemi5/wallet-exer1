Feature: Reserve balance

  Scenario: Create reserved balance for a context
    Given I would like to set aside 400 for "gacha" spending, assuming I have 500 in my balance
    Then a reserved balance is created with the amount of 500 while my balance should be subtracted by that amount.

  Scenario: Update reserved balance for a context
    Given I like to use 200 in my reserved balance for "gacha" in a game
    Then my reserved balance should decrease by 200

  Scenario: Release reserved balance for a context
    Given that I would like to release my remaining reserved balance for "gacha"
    Then the remaining balance should be added to my balance, while the reserved balance for a given context will be deleted
