Feature: Pagination

  Scenario: Pagination successfully renders pages
    Given I am an authenticated user on the first job roles page
    And the job roles page is visible
    And I scroll to the bottom of the page
    And the previous page control is disabled
    And page 1 is selected
    And the next page control is clickable
    When I click the next page control
    Then the second job roles page is displayed
    And the second page contains job roles
