Feature: Login functionality
    As a user with an existing account
    I want to log in and see job-roles page
    So that I can browse job-role offers

    Scenario: User can log in and view job roles
    Given I am on the login page
    Then I can see the login form
    When I fill in the login form with email "example@example.com" and password "#Example123"
    And I submit the login form
    Then I should be redirected to the job roles page
