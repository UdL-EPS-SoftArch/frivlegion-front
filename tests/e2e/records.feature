Feature: Create records from the user profile
  In order to keep some records private and share others
  As a registered user
  I want to define the visibility of the records I create

  Scenario: Create a private record
    Given I open the main page
    When I click the button "Login"
    And I enter "demo" and "password"
    Then I should see the user page for "demo"
    When I create a new record with name "Private E2E Record" and description "Visible only to me" and status "PRIVATE"
    Then I should see the record "Private E2E Record" with status "PRIVATE" in the list

  Scenario: Create a public record
    Given I open the main page
    When I click the button "Login"
    And I enter "demo" and "password"
    Then I should see the user page for "demo"
    When I create a new record with name "Public E2E Record" and description "Visible to everyone" and status "PUBLIC"
    Then I should see the record "Public E2E Record" with status "PUBLIC" in the list
    When I click on the record link "Public E2E Record"
    Then I should see the record detail page for "Public E2E Record" with status "PUBLIC"

  Scenario: A record without an explicit status is private by default
    Given I open the main page
    When I click the button "Login"
    And I enter "demo" and "password"
    Then I should see the user page for "demo"
    When I create a new record with name "Default E2E Record" and description "No status chosen"
    Then I should see the record "Default E2E Record" with status "PRIVATE" in the list
