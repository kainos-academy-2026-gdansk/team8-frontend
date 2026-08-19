Feature: Registration page
  As a new user
  I want to view the registration form
  So that I can create an account

  Scenario: Registration form is available
    Given I am on the registration page
    Then I can see the registration form
    And the password fields are hidden
    And the create account button is enabled
