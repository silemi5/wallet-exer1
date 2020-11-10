Feature: Virtual balance

  Scenario: Create virtual balance for a context
    Given I would like to held "400" for "rolling" context
    Then a virtual balance is created with the amount of "400" for that context

  Scenario: Update virtual balance for a context
    Given I like to use "200" in my virtual balance in my "rolling" context
    Then my virtual balance on "rolling" context should decrease by "200"

  Scenario: Cancel virtual balance
    Given I like to cancel my virtual balance on a context
    Then that virtual balance should be resetted to "0"

  Scenario: Commit virtual balance
    Given I like to commit my virtual balance on a context
    Then all my virtual balance for that context should be transferred to my main balance
